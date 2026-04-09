---
type: entity
tags: [narzędzie, mcp, ai, konfiguracja]
---

# Gemini MCP Server (`@rlabs-inc/gemini-mcp`)

## Czym jest

Serwer MCP (Model Context Protocol) integrujący Google Gemini z Claude Code. Umożliwia Claude wywoływanie Gemini bezpośrednio z sesji jako narzędzie — m.in. do głębokiego rozumowania, analizy plików i generowania obrazów.

Pakiet npm: `@rlabs-inc/gemini-mcp` (v0.8.1+, aktywnie rozwijany)

## Kluczowe fakty

- **Wymagana zmienna środowiskowa:** `GEMINI_API_KEY` (nie `GOOGLE_API_KEY`)
- **Zakres konfiguracji:** projekt-level (`.claude/settings.json`) lub user-level (`~/.claude/settings.json`)
- **Poprzedni błędny pakiet:** `@google/mcp-server-gemini` — nie istnieje na npm (404)

### Obsługiwane modele

| Model | Zastosowanie |
|---|---|
| `gemini-3-pro-preview` | Domyślny dla złożonego rozumowania |
| `gemini-3-flash-preview` | Szybsze odpowiedzi, niższy koszt |
| `gemini-3-pro-image-preview` | Generowanie obrazów |
| `veo-2.0-generate-001` | Generowanie wideo |

### Thinking Levels

Poziom rozumowania kontrolowany parametrem `thinking_level`:

| Poziom | Opis |
|---|---|
| `minimal` | Najszybszy, bez głębokiego rozumowania |
| `low` | Minimalne kroki rozumowania |
| `medium` | Zrównoważony |
| `high` | Domyślny dla Pro; maksymalna głębokość rozumowania |

### Natywna analiza plików

Obsługuje: PDF, DOCX, arkusze kalkulacyjne — z ekstrakcją tabel (markdown, CSV, JSON).

## Konfiguracja w projekcie

Plik: `.claude/settings.json`

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["-y", "@rlabs-inc/gemini-mcp"],
      "env": {
        "GEMINI_API_KEY": "<klucz>"
      }
    }
  }
}
```

## Historia konfiguracji w tym projekcie

- **2026-04-05:** Pierwotna konfiguracja używała nieistniejącego pakietu `@google/mcp-server-gemini` z błędną zmienną `GOOGLE_API_KEY`. Poprawiono na `@rlabs-inc/gemini-mcp` + `GEMINI_API_KEY`.

## Źródła
- [[sources/google-stitch-ui-tool]] — kontekst integracji AI tools z tym projektem

## Powiązane
- [[concepts/llm-wiki-pattern]]
- [[entities/google-stitch]]
