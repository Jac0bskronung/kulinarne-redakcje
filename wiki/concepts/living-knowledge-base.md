---
type: concept
tags: [knowledge-management, llm, wiki, compounding]
---

# Living Knowledge Base

## Definicja

Persistentna baza wiedzy w formie powiązanych plików Markdown, którą **LLM aktywnie pisze i utrzymuje** — nie tylko przeszukuje. Wiedza kumuluje się z każdą interakcją. Przeciwieństwo RAG, gdzie LLM odkrywa wiedzę od zera przy każdym zapytaniu.

## Jak to działa

Zamknięta pętla:

```
Zbierz źródła
    ↓
LLM organizuje w wiki (pisze strony, linki, syntezy)
    ↓
Zadaj pytanie → LLM czyta wiki → odpowiedź
    ↓
Odpowiedź jest zapisywana z powrotem do wiki
    ↑___________________________________|
```

Kluczowa różnica od RAG:
| RAG | Living Knowledge Base |
|---|---|
| Szuka w surowych dokumentach | Czyta skompilowaną wiki |
| Odkrywa wiedzę od zera | Wiedza już jest zsyntetyzowana |
| Outputs znikają w historii czatu | Outputs wracają do wiki |
| Nie rośnie | Rośnie z każdą interakcją |

## Dlaczego działa (psychologia utrzymania wiki)

Ludzie porzucają wiki bo koszt utrzymania rośnie szybciej niż wartość. LLM nie nuży się, nie zapomina zaktualizować cross-reference, może dotknąć 15 plików w jednym przebiegu.

## Komponenty

1. **raw/** — niezmienne źródła (artykuły, notatki, PDFy, dane)
2. **wiki/** — warstwa LLM-owned (podsumowania, strony encji, koncepcji, syntezy)
3. **Schema** (CLAUDE.md) — instrukcja jak LLM ma operować na wiki

## Skala bez RAG

Karpathy: ~100 artykułów / ~400K słów — wystarczy własny `index.md`, bez embeddings ani wektorowej bazy.

## Powiązane koncepcje

- [[concepts/llm-wiki-pattern]]
- [[concepts/rag]] _(do utworzenia — dla porównania)_

## Źródła

- [[sources/karpathy-llm-wiki-post]]
