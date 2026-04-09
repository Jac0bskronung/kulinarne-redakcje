---
type: concept
tags: [pattern, workflow, llm, obsidian]
---

# LLM Wiki Pattern

## Definicja

Wzorzec architektoniczny dla osobistych baz wiedzy. LLM pełni rolę "programisty"; wiki to "codebase"; Obsidian to "IDE"; użytkownik to "tech lead".

## Trzy operacje

### Ingest
Nowe źródło → LLM czyta → pisze stronę podsumowania → aktualizuje strony encji i koncepcji → aktualizuje index i log. Jedno źródło może dotknąć 10-15 stron wiki.

### Query
Pytanie → LLM czyta index → czyta trafne strony → odpowiedź z cytatami → wartościowe odpowiedzi zapisywane jako nowe strony (syntezy).

### Lint (Health Check)
Przegląd wiki: strony osierocone, sprzeczności, brakujące cross-references, luki do wypełnienia web searchem.

## Pliki specjalne

- **index.md** — orientowany na treść katalog stron (LLM czyta go przy każdym query)
- **log.md** — append-only chronologiczny dziennik operacji

## Koneksja z Memex (Vannevar Bush, 1945)

Bush przewidział prywatny, kurowany store wiedzy z "asociacyjnymi ścieżkami" między dokumentami. Nie rozwiązał kwestii kto robi maintenance. LLM to rozwiązuje.

## Powiązane koncepcje

- [[concepts/living-knowledge-base]]

## Źródła

- [[sources/karpathy-llm-wiki-post]]
