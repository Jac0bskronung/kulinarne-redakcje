/**
 * Budget text parser — extracts item name, amount, room, and expense type
 * from free-form Polish text using keyword hints.
 *
 * Pure function, no side effects, no API calls.
 */

/**
 * @param {string} text - Raw user input
 * @param {Array} rooms - [{id, name, icon, sort_order}]
 * @param {Array} expenseTypes - [{id, name, icon, sort_order}]
 * @param {Array} keywordHints - [{id, keyword, room_id, expense_type_id, priority}]
 * @returns {{ name: string, estimated_amount: number|null, room_id: string|null, expense_type_id: string|null, confidence: number, status: string, source_text: string, source_url: string|null }}
 */
export function budgetParser(text, rooms, expenseTypes, keywordHints) {
  const original = text.trim();
  if (!original) {
    return {
      name: '',
      estimated_amount: null,
      room_id: null,
      expense_type_id: null,
      confidence: 0,
      status: 'needs_review',
      source_text: original,
      source_url: null,
    };
  }

  // --- 0. Extract URL if present ---
  const { url, textWithoutUrl } = extractUrl(original);

  // --- 1. Extract amount ---
  const { amount, textWithoutAmount } = extractAmount(textWithoutUrl);

  // --- 2. Build name (everything that's not the amount or URL) ---
  let name = textWithoutAmount.replace(/\s+/g, ' ').trim();

  // If only a URL was sent (no other text), use domain as name
  if (!name && url) {
    name = extractDomain(url);
  }

  // --- 3. Match keywords ---
  const lowerText = textWithoutUrl.toLowerCase();
  const { roomId, expenseTypeId } = matchKeywords(lowerText, keywordHints);

  // --- 4. Confidence & status ---
  let confidence = 0;
  if (amount != null) confidence += 0.3;
  if (roomId != null) confidence += 0.35;
  if (expenseTypeId != null) confidence += 0.35;

  // URLs default to inspiration status, regardless of confidence
  let status;
  if (url) {
    status = 'inspiration';
  } else {
    status = confidence >= 0.65 ? 'planned' : 'needs_review';
  }

  return {
    name: name || original,
    estimated_amount: amount,
    room_id: roomId,
    expense_type_id: expenseTypeId,
    confidence: Math.round(confidence * 100) / 100,
    status,
    source_text: original,
    source_url: url,
  };
}

/**
 * Extract a URL from the text and return the remaining text.
 */
function extractUrl(text) {
  const urlPattern = /https?:\/\/[^\s]+/i;
  const match = text.match(urlPattern);
  if (match) {
    const url = match[0];
    const textWithoutUrl = text.replace(url, '').trim();
    return { url, textWithoutUrl };
  }
  return { url: null, textWithoutUrl: text };
}

/**
 * Extract domain name from a URL (e.g. "https://www.ikea.com/path" → "ikea.com")
 */
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    // Remove "www." prefix
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Extract a numeric amount from the text.
 * Supports: "1500", "1 500", "1500zł", "1500 zł", "1,5k", "2.5k"
 */
function extractAmount(text) {
  // Try "k" notation first: "2.5k", "1,5k", "2k"
  const kPattern = /(\d+(?:[.,]\d+)?)\s*k\b/i;
  const kMatch = text.match(kPattern);
  if (kMatch) {
    const numStr = kMatch[1].replace(',', '.');
    const amount = parseFloat(numStr) * 1000;
    const textWithoutAmount = text.replace(kMatch[0], '').trim();
    return { amount, textWithoutAmount };
  }

  // Try regular numbers: "1 500 zł", "1500zł", "1500"
  // Match number with optional space-separated thousands, optional "zł" suffix
  const numPattern = /(\d{1,3}(?:\s\d{3})*|\d+)\s*(?:zł|PLN|pln)?\b/gi;
  let bestMatch = null;
  let bestAmount = null;
  let match;

  while ((match = numPattern.exec(text)) !== null) {
    const raw = match[1].replace(/\s/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      // Prefer the largest number, or last found (usually the amount)
      if (bestAmount === null || num >= bestAmount) {
        bestAmount = num;
        bestMatch = match;
      }
    }
  }

  if (bestMatch && bestAmount !== null) {
    const textWithoutAmount = text.replace(bestMatch[0], '').trim();
    return { amount: bestAmount, textWithoutAmount };
  }

  return { amount: null, textWithoutAmount: text };
}

/**
 * Match keywords from hints against the input text.
 * Case-insensitive, supports partial matches (includes).
 * Returns the highest-priority room_id and expense_type_id.
 */
function matchKeywords(lowerText, keywordHints) {
  let roomId = null;
  let roomPriority = -1;
  let expenseTypeId = null;
  let typePriority = -1;

  for (const hint of keywordHints) {
    const keyword = hint.keyword.toLowerCase();
    // Check if any word in the text starts with the keyword, or the keyword is included in any word
    const words = lowerText.split(/\s+/);
    const matched = words.some(w => w.includes(keyword) || keyword.includes(w));

    if (!matched) continue;

    const pri = hint.priority ?? 0;

    if (hint.room_id && pri > roomPriority) {
      roomId = hint.room_id;
      roomPriority = pri;
    }
    if (hint.expense_type_id && pri > typePriority) {
      expenseTypeId = hint.expense_type_id;
      typePriority = pri;
    }
  }

  return { roomId, expenseTypeId };
}
