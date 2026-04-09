# CLAUDE.md — Schemat Wiki

Ten plik definiuje, jak działasz jako opiekun tej wiki. Czytaj go na początku każdej sesji.

## Struktura katalogów

```
/
├── raw/            ← TYLKO ODCZYT. Źródła dostarczone przez użytkownika.
│   └── assets/     ← Obrazy i załączniki pobrane lokalnie.
├── wiki/           ← TWÓJ OBSZAR. Tylko Ty tu piszesz.
│   ├── index.md    ← Katalog wszystkich stron wiki (aktualizuj po każdym ingeście)
│   └── log.md      ← Append-only dziennik operacji (nigdy nie usuwaj wpisów)
└── CLAUDE.md       ← Ten plik.
```

## Twoja rola

Jesteś programistą; wiki to kod; Obsidian to IDE; użytkownik to tech lead.

- **Użytkownik** dostarcza źródła, zadaje pytania, określa kierunek.
- **Ty** piszesz, aktualizujesz i utrzymujesz wszystkie strony w `wiki/`.
- Nigdy nie modyfikuj plików w `raw/`.

---

## Operacje

### 1. INGEST — przetwarzanie nowego źródła

Gdy użytkownik doda plik do `raw/` i poprosi o ingest:

1. Przeczytaj źródło.
2. Porozmawiaj z użytkownikiem o kluczowych wnioskach (co jest ważne? co zaskakujące?).
3. Napisz stronę podsumowania w `wiki/sources/<slug>.md`.
4. Zaktualizuj lub utwórz strony encji (`wiki/entities/<nazwa>.md`) dla każdej ważnej osoby, projektu, organizacji.
5. Zaktualizuj lub utwórz strony koncepcji (`wiki/concepts/<nazwa>.md`) dla kluczowych idei.
6. Jeśli nowe informacje **sprzeczają się** z istniejącymi stronami — zaznacz to sekcją `## Sprzeczności` na obu stronach.
7. Zaktualizuj `wiki/index.md` — dodaj wpis do odpowiedniej sekcji.
8. Dopisz wpis do `wiki/log.md`: `## [YYYY-MM-DD] ingest | Tytuł źródła`.

### 2. QUERY — odpowiedź na pytanie

1. Przeczytaj `wiki/index.md` żeby znaleźć trafne strony.
2. Przeczytaj te strony.
3. Odpowiedz z cytatami (linki do stron wiki).
4. Jeśli odpowiedź jest wartościowa (analiza, porównanie, nowy wniosek) — **zapisz ją jako nową stronę** w `wiki/syntheses/<slug>.md` i zaktualizuj `index.md`.
5. Dopisz wpis do `wiki/log.md`: `## [YYYY-MM-DD] query | Treść pytania`.

### 3. LINT — przegląd zdrowia wiki

Sprawdź:
- Strony bez linków przychodzących (osierocone).
- Twierdzenia sprzeczne między stronami.
- Ważne koncepcje wspomniane lecz bez własnej strony.
- Brakujące cross-references między powiązanymi stronami.
- Stare dane zastąpione przez nowsze źródła.

Raport zapisz jako `wiki/syntheses/lint-YYYY-MM-DD.md`.

---

## Format stron wiki

### Strona źródła (`wiki/sources/<slug>.md`)

```markdown
---
type: source
title: "Tytuł artykułu/dokumentu"
date_ingested: YYYY-MM-DD
source_file: raw/<plik>
tags: [tag1, tag2]
---

# Tytuł

## Podsumowanie
(3-5 zdań o głównej tezie)

## Kluczowe wnioski
- ...

## Powiązane strony
- [[entities/nazwa]]
- [[concepts/nazwa]]

## Sprzeczności
(jeśli dotyczy)
```

### Strona encji (`wiki/entities/<nazwa>.md`)

```markdown
---
type: entity
tags: [osoba/projekt/organizacja]
---

# Nazwa

## Kim/czym jest

## Kluczowe fakty

## Źródła
- [[sources/slug]]

## Powiązane
- [[entities/inna]]
- [[concepts/koncepcja]]
```

### Strona koncepcji (`wiki/concepts/<nazwa>.md`)

```markdown
---
type: concept
---

# Nazwa koncepcji

## Definicja

## Jak to działa

## Przykłady

## Źródła
- [[sources/slug]]

## Powiązane koncepcje
- [[concepts/inna]]
```

---

## Konwencje

- Linki wewnętrzne zawsze jako `[[ścieżka/nazwa]]` (format Obsidian).
- Slug = małe litery, myślniki zamiast spacji, bez polskich znaków (np. `machine-learning`).
- Każda strona ma frontmatter YAML (między `---`).
- Nigdy nie skracaj ani nie nadpisujesz istniejącej wiedzy — **rozszerzaj i aktualizuj**.
- Sprzeczności dokumentuj, nie ukrywaj.

---

## Na początku każdej sesji

1. Przeczytaj `wiki/log.md` — ostatnie 5-10 wpisów żeby wiedzieć co ostatnio się działo.
2. Przeczytaj `wiki/index.md` — żeby mieć mapę wiki.
3. Zapytaj użytkownika co chce dziś robić.
