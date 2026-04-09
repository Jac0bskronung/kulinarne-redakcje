---
type: source
title: "Karpathy — How LLMs Turn Raw Research Into a Living Knowledge Base"
date_ingested: 2026-04-05
source_file: raw/ (zdjęcia z posta + infografika, chat)
tags: [llm-wiki, karpathy, knowledge-base, obsidian, workflow]
---

# Karpathy — How LLMs Turn Raw Research Into a Living Knowledge Base

## Podsumowanie

Andrej Karpathy opisuje zmianę w swoim workflow: zamiast używać AI do pisania kodu, coraz więcej czasu spędza na budowaniu osobistych baz wiedzy. LLM nie tylko odpowiada na pytania — **kompiluje i utrzymuje persistentną wiki** z markdownowych plików w Obsidianie. Kluczowy insight: każde pytanie zadane do wiki może wzbogacić wiki o nową stronę, tworząc zamkniętą pętlę akumulacji wiedzy.

## Kluczowe wnioski

- **Pętla jest zamknięta**: `zbierz źródła → LLM organizuje → zadaj pytanie → wyrenderuj output → zapisz z powrotem do wiki`. Outputs wracają do wiki, więc każda interakcja ją wzbogaca.
- **Bez RAG przy skali ~100 artykułów / ~400K słów**: LLM utrzymuje własne pliki indeksowe i czyta to czego potrzebuje. Nie trzeba embeddings ani wektorowych baz danych.
- **Outputs to nie tylko tekst**: slide decki (Marp), wykresy (Matplotlib), obrazy — wszystkie viewable bezpośrednio w Obsidianie i zapisywane z powrotem do wiki.
- **Health checks**: LLM aktywnie szuka niespójności, wypełnia luki web searchem, sugeruje nowe połączenia. Wiki "leczy się" sama.
- **Vibe-coded search engine**: własna wyszukiwarka nad wiki w przeglądarce lub jako narzędzie dla LLM przy dużych pytaniach.
- **Następny krok — custom model**: trenowanie modelu na własnej wiki tak, żeby wiedza była w wagach, nie tylko w context window.

## Cytat-klucz

> "You never write the wiki. The LLM writes everything. You just steer — and every answer compounds."

## Pipeline (z infografiki)

```
STEP 01: Collect Sources
  → artykuły, papers, repozytoria, dane, obrazy
  → Obsidian Web Clipper do clipowania artykułów
  → zdjęcia pobierane lokalnie

STEP 02: LLM Organizes Wiki
  → LLM czyta raw/ i buduje wiki z .md
  → auto-generowany index.md
  → strony koncepcji per temat
  → linki między powiązanymi ideami

STEP 03: Ask Questions
  → query wiki złożonymi pytaniami
  → LLM czyta własny index i znajduje odpowiedzi
  → ~100 artykułów / ~400K słów bez RAG

STEP 04: Render Outputs
  → Markdown articles
  → Marp slide decks
  → Matplotlib charts and plots

STEP 05: File Back to Wiki
  → każdy output wraca do wiki/
  → wiedza kumuluje się
  → pętla się nie kończy
```

## Powiązane strony

- [[entities/andrej-karpathy]]
- [[concepts/living-knowledge-base]]
- [[concepts/llm-wiki-pattern]]

## Uwagi do porównania z artykułem bazowym

Infografika dodaje explicite **pętlę zwrotną** (file back → wiki), którą artykuł opisuje słownie ale nie wizualizuje. Wzmianka o trenowaniu custom modelu pojawia się tylko w poście, nie w artykule LLM Wiki.
