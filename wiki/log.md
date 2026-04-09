# Log

Chronologiczny zapis wszystkich operacji na wiki. Nie modyfikuj ręcznie.

Format wpisów: `## [YYYY-MM-DD] typ | opis`
Typy: `ingest`, `query`, `lint`, `init`

---

## [2026-04-05] init | Inicjalizacja wiki

Utworzono strukturę katalogów i pliki bazowe:
- `wiki/index.md` — indeks treści
- `wiki/log.md` — ten plik
- `raw/` — katalog na źródła
- `raw/assets/` — katalog na obrazy i załączniki
- `CLAUDE.md` — schemat operacji

Vault: `C:/Users/kubas/Documents/Claude/Projects/Obsidian+Gemini+stitch`

---

## [2026-04-05] ingest | Karpathy — How LLMs Turn Raw Research Into a Living Knowledge Base

Źródło: post tekstowy + infografika (zdjęcia w chacie, nie plik w raw/).
Utworzone strony:
- `wiki/sources/karpathy-llm-wiki-post.md`
- `wiki/entities/andrej-karpathy.md`
- `wiki/concepts/living-knowledge-base.md`
- `wiki/concepts/llm-wiki-pattern.md`

Zaktualizowane: `wiki/index.md`

---

## [2026-04-05] ingest | aniagotuje.pl — 10 najwyżej ocenianych dań głównych (polska + azjatycka)

Źródło: scraping aniagotuje.pl (kategorie: dania-miesne, dania-bez-miesa, dania-rybne, pomysl-na/obiad).
Kryteria: ocena ≥4.8, dania główne, kuchnia polska lub azjatycka, bez zup/sałatek/kremów.

Utworzone strony:
- `wiki/recipes/kluski-ziemniaczane-po-azjatycku.md` (5.0★)
- `wiki/recipes/karp-z-pieczarkami.md` (4.9★)
- `wiki/recipes/makaron-z-kurczakiem-curry.md` (4.9★)
- `wiki/recipes/biala-kielbasa-pieczona-z-ziemniakami.md` (4.9★)
- `wiki/recipes/kapusta-z-fasola.md` (4.9★)
- `wiki/recipes/curry-z-dynia-i-ciecierzyca.md` (4.8★)
- `wiki/recipes/schab-po-wegiersku.md` (4.8★)
- `wiki/recipes/poledwiczki-w-sosie-kurkowym.md` (4.8★)
- `wiki/recipes/gulasz-z-kurczaka.md` (4.8★)
- `wiki/recipes/ryba-po-grecku.md` (4.8★)
- `wiki/syntheses/plan-tygodniowy.md` — tabela + propozycja planu 7-dniowego

Zaktualizowane: `wiki/index.md`

---

## [2026-04-05] query | Konfiguracja Gemini MCP Server w projekcie

Diagnoza błędnej konfiguracji MCP (`@google/mcp-server-gemini` → 404).
Poprawiono na `@rlabs-inc/gemini-mcp` v0.8.1 z `GEMINI_API_KEY`.
Udokumentowano thinking levels i native file analysis.

Utworzone strony:
- `wiki/entities/gemini-mcp-server.md`

Zaktualizowane: `wiki/index.md`

---

## [2026-04-05] query | Jak przygotować UI z Google Stitch dla nowej aplikacji?

Odpowiedź zapisana w wiki:
- `wiki/sources/google-stitch-ui-tool.md`
- `wiki/entities/google-stitch.md`
- `wiki/concepts/vibe-design.md`

---

## [2026-04-06] ingest | Kontynuacja: przepisy z listy użytkownika — udka + aktualizacja indeksu

Dokończono zadanie przerwane przez limit kontekstu.
Dodany przepis:
- `wiki/recipes/udka-pieczone.md` (4.8★, 5976 głosów) — uwzględnia też skrzydełka (brak osobnego przepisu na aniagotuje.pl)

Zaktualizowane:
- `wiki/index.md` — uzupełniony o wszystkie 23 przepisy (poprzednio miał tylko 10)
- `wiki/syntheses/plan-tygodniowy.md` — pełna przebudowa: tabela "bardzo lubię" + tabela "lubię", filtry (czas, diety, kuchnia, mięso), nowy plan tygodniowy

---

## [2026-04-06] query | Projektowanie siatki agentów z przypisaniem modeli

Zaprojektowano i wdrożono siatkę 6 agentów w `.claude/agents/`:
- `dispatcher` (Haiku) — routing zadań
- `researcher` (Haiku) — zbieranie informacji
- `wiki-writer` (Sonnet) — tworzenie/aktualizacja wiki
- `coder` (Opus, high effort) — implementacja kodu
- `reviewer` (Sonnet) — kontrola jakości
- `note-taker` (Haiku) — pamięć operacyjna

Dokumentacja architektury: `wiki/syntheses/agent-network-architecture.md`
