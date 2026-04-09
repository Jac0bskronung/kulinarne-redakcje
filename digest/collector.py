#!/usr/bin/env python3
"""
Daily Digest Collector
Pobiera AI newsy (RSS) + wyniki piłkarskie, generuje artykuł po polsku,
zapisuje do Supabase i wiki/digest/.
"""

import os
import json
import datetime
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import sys

# ── Config ─────────────────────────────────────────────────────────────────
GEMINI_API_KEY     = os.environ["GEMINI_API_KEY"]
FOOTBALL_API_KEY   = os.environ["FOOTBALL_API_KEY"]
SUPABASE_URL       = os.environ["SUPABASE_URL"]
SUPABASE_KEY       = os.environ["SUPABASE_SERVICE_KEY"]   # service role key
WIKI_DIR           = os.environ.get("WIKI_DIR", "wiki/digest")

NOW        = datetime.datetime.utcnow() + datetime.timedelta(hours=2)   # PL time
DATE_STR   = NOW.strftime("%Y-%m-%d")
HOUR       = NOW.hour
EDITION    = "morning" if HOUR < 12 else "evening"
EDITION_PL = "Poranny" if EDITION == "morning" else "Wieczorny"

# ── RSS Sources ─────────────────────────────────────────────────────────────
RSS_FEEDS = [
    ("TLDR AI",         "https://tldr.tech/api/rss/ai"),
    ("HackerNews AI",   "https://hnrss.org/newest?q=AI+LLM+claude+gemini&count=15"),
    ("Simon Willison",  "https://simonwillison.net/atom/entries/"),
    ("VentureBeat AI",  "https://venturebeat.com/category/ai/feed/"),
    ("MIT Tech Review", "https://www.technologyreview.com/feed/"),
]

def fetch_url(url, headers=None, timeout=15):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": "DigestBot/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")

def fetch_rss(name, url):
    """Zwraca listę {title, link, summary} z ostatnich 24h."""
    try:
        raw = fetch_url(url)
        root = ET.fromstring(raw)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        items = []

        # Atom feed
        for entry in root.findall(".//atom:entry", ns)[:8]:
            t = entry.findtext("atom:title", "", ns).strip()
            l = entry.findtext("atom:link[@rel='alternate']", "", ns) or \
                (entry.find("atom:link", ns).get("href", "") if entry.find("atom:link", ns) is not None else "")
            s = entry.findtext("atom:summary", "", ns) or entry.findtext("atom:content", "", ns) or ""
            if t:
                items.append({"title": t, "link": l, "summary": s[:400]})

        # RSS feed
        if not items:
            for item in root.findall(".//item")[:8]:
                t = (item.findtext("title") or "").strip()
                l = item.findtext("link") or ""
                s = item.findtext("description") or ""
                if t:
                    items.append({"title": t, "link": l, "summary": s[:400]})

        return items
    except Exception as e:
        print(f"  [RSS] {name}: {e}", file=sys.stderr)
        return []

def fetch_football():
    """Wyniki La Liga (PD) i Ligi Mistrzów (CL) z ostatnich 3 dni."""
    results = []
    competitions = [("PD", "La Liga"), ("CL", "Liga Mistrzów")]
    date_from = (NOW - datetime.timedelta(days=3)).strftime("%Y-%m-%d")
    date_to   = NOW.strftime("%Y-%m-%d")

    for code, name in competitions:
        url = (f"https://api.football-data.org/v4/competitions/{code}/matches"
               f"?status=FINISHED&dateFrom={date_from}&dateTo={date_to}")
        try:
            raw = fetch_url(url, headers={
                "X-Auth-Token": FOOTBALL_API_KEY,
                "User-Agent": "DigestBot/1.0"
            })
            data = json.loads(raw)
            for m in data.get("matches", [])[-6:]:   # max 6 meczów
                home = m["homeTeam"]["shortName"] or m["homeTeam"]["name"]
                away = m["awayTeam"]["shortName"] or m["awayTeam"]["name"]
                gh   = m["score"]["fullTime"]["home"]
                ga   = m["score"]["fullTime"]["away"]
                date = m["utcDate"][:10]
                results.append({
                    "competition": name,
                    "date": date,
                    "home": home,
                    "away": away,
                    "score": f"{gh}:{ga}"
                })
        except Exception as e:
            print(f"  [Football] {name}: {e}", file=sys.stderr)

    return results

def build_prompt(ai_items, football_results):
    ai_section = "\n".join(
        f"- [{s['source']}] {s['title']}: {s['summary'][:200]}"
        for s in ai_items
    )
    fb_section = "\n".join(
        f"- {r['competition']} ({r['date']}): {r['home']} {r['score']} {r['away']}"
        for r in football_results
    ) or "Brak wyników w ostatnich 3 dniach."

    return f"""Jesteś redaktorem polskiego centrum informacji. Napisz digest {EDITION_PL.lower()} na {DATE_STR}.

## Dostępne materiały

### AI & Tech newsy:
{ai_section}

### Wyniki piłkarskie:
{fb_section}

## Zadanie
Napisz zwięzły, czytelny artykuł PO POLSKU w formacie Markdown:

1. Nagłówek H1: "Digest {EDITION_PL} — {DATE_STR}"
2. Sekcja "## 🤖 AI & Tech" — 4-6 najciekawszych newsów, każdy jako:
   **Tytuł po polsku** — 2-3 zdania wyjaśnienia. [Źródło]
3. Sekcja "## ⚽ Piłka nożna" — wyniki meczów, krótki komentarz do najciekawszych
4. Sekcja "## 💡 To warto zapamiętać" — 3 bullet pointy z kluczowymi wnioskami dnia

Styl: profesjonalny ale przystępny. Tłumacz tytuły i terminy na polski. Bądź konkretny, nie lej wody."""

def list_gemini_models():
    """Zwraca listę dostępnych modeli Gemini."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1/models?key={GEMINI_API_KEY}"
        raw = fetch_url(url)
        data = json.loads(raw)
        names = [m["name"].replace("models/", "") for m in data.get("models", [])
                 if "generateContent" in m.get("supportedGenerationMethods", [])]
        print(f"  [Gemini] Dostępne modele: {names[:8]}")
        return names
    except Exception as e:
        print(f"  [Gemini] Nie można pobrać listy modeli: {e}", file=sys.stderr)
        return []

def call_gemini(prompt):
    # Pobierz dostępne modele, preferuj flash
    available = list_gemini_models()
    preferred = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash",
                 "gemini-2.5-pro", "gemini-2.0-pro"]
    models = [m for m in preferred if m in available] or available[:3] or preferred

    last_err = None
    for model in models:
        url = (f"https://generativelanguage.googleapis.com/v1/models/"
               f"{model}:generateContent?key={GEMINI_API_KEY}")
        body = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"maxOutputTokens": 2000, "temperature": 0.7}
        }).encode()
        try:
            req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.loads(r.read())
            candidate = data["candidates"][0]
            finish = candidate.get("finishReason", "UNKNOWN")
            print(f"  [Gemini] Model: {model}, finishReason: {finish}")
            if finish not in ("STOP", "MAX_TOKENS"):
                print(f"  [Gemini] Pełna odpowiedź: {json.dumps(candidate)[:500]}", file=sys.stderr)
                last_err = RuntimeError(f"finishReason={finish}")
                continue
            return candidate["content"]["parts"][0]["text"]
        except urllib.error.HTTPError as e:
            body_err = e.read().decode("utf-8", errors="replace")[:300]
            print(f"  [Gemini] {model}: HTTP {e.code} — {body_err}", file=sys.stderr)
            last_err = e
    raise RuntimeError(f"Gemini: wszystkie modele zawiodły. Ostatni błąd: {last_err}")

def save_to_supabase(title, content, ai_items, football_results):
    body = json.dumps({
        "date": DATE_STR,
        "edition": EDITION,
        "title": title,
        "content": content,
        "ai_items": ai_items,
        "football_results": football_results
    }).encode()

    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/digests",
        data=body,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            print(f"  [Supabase] Status: {r.status}")
    except urllib.error.HTTPError as e:
        body_err = e.read().decode("utf-8", errors="replace")[:500]
        print(f"  [Supabase] HTTP {e.code}: {body_err}", file=sys.stderr)
        raise

def save_to_wiki(title, content):
    os.makedirs(WIKI_DIR, exist_ok=True)
    slug = f"{DATE_STR}-{EDITION}"
    path = os.path.join(WIKI_DIR, f"{slug}.md")
    frontmatter = f"""---
type: digest
title: "{title}"
date: {DATE_STR}
edition: {EDITION}
---

"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(frontmatter + content)
    print(f"  [Wiki] Zapisano: {path}")

def main():
    print(f"\n=== DIGEST {EDITION_PL.upper()} {DATE_STR} ===\n")

    # 1. Zbierz dane
    print("1. Pobieranie newsów AI...")
    ai_items = []
    for name, url in RSS_FEEDS:
        items = fetch_rss(name, url)
        for item in items:
            item["source"] = name
        ai_items.extend(items)
        print(f"   {name}: {len(items)} artykułów")

    print(f"\n2. Pobieranie wyników piłkarskich...")
    football_results = fetch_football()
    print(f"   Znaleziono {len(football_results)} wyników")

    # 2. Generuj artykuł
    print(f"\n3. Generowanie artykułu (Claude Sonnet)...")
    prompt = build_prompt(ai_items[:20], football_results)  # max 20 AI newsów
    content = call_gemini(prompt)
    title = f"Digest {EDITION_PL} — {DATE_STR}"
    print(f"   Wygenerowano {len(content)} znaków")

    # 3. Zapisz
    print(f"\n4. Zapisywanie...")
    save_to_supabase(title, content, ai_items[:20], football_results)
    save_to_wiki(title, content)

    print(f"\n✓ Digest gotowy!\n")

if __name__ == "__main__":
    main()
