---
type: synthesis
title: "Architektura Siatki Agentów — Claude Code"
date: 2026-04-06
tags: [agents, architecture, claude-code, optimization]
---

# Architektura Siatki Agentów

## Cel

Siatka agentów rozdziela pracę między wyspecjalizowane podmioty zoptymalizowane pod kątem kosztu tokenów i jakości. Drogi model (Opus) tylko tam gdzie potrzebna jest głęboka analiza; tani model (Haiku) dla routingu i notatek.

## Schemat

```
Użytkownik
    │
    ▼
┌───────────┐
│ dispatcher│ ← Haiku (routing, brak myślenia)
└─────┬─────┘
      │ decyduje
      ├──────────────────────────────────┐
      ▼                                  ▼
┌──────────┐  ┌────────────┐  ┌───────────┐  ┌──────────┐
│researcher│  │ wiki-writer│  │   coder   │  │ reviewer │
│  Haiku   │  │  Sonnet    │  │   Opus    │  │  Sonnet  │
│ low eff. │  │ med. eff.  │  │ high eff. │  │ med eff. │
└──────────┘  └────────────┘  └───────────┘  └──────────┘
                                              po zadaniu
                                                  │
                                                  ▼
                                          ┌────────────┐
                                          │ note-taker │
                                          │   Haiku    │
                                          │  low eff.  │
                                          └────────────┘
```

## Agenci

### dispatcher
| Parametr | Wartość |
|----------|---------|
| Model | `claude-haiku-4-5` |
| Effort | — (brak, tylko routing) |
| Narzędzia | `Read` |
| Plik | `.claude/agents/dispatcher.md` |

**Rola:** Punkt wejścia. Analizuje zadanie i zwraca nazwę agenta + uzasadnienie. Nie wykonuje pracy merytorycznej.

---

### researcher
| Parametr | Wartość |
|----------|---------|
| Model | `claude-haiku-4-5` |
| Effort | low |
| Narzędzia | `Read, Glob, Grep, WebSearch, WebFetch` |
| Plik | `.claude/agents/researcher.md` |

**Rola:** Czyta wiki, raw/, sieć. Zwraca fakty i luki. Nigdy nie modyfikuje plików.

---

### wiki-writer
| Parametr | Wartość |
|----------|---------|
| Model | `claude-sonnet-4-6` |
| Effort | medium |
| Narzędzia | `Read, Write, Edit, Glob, Grep` |
| Plik | `.claude/agents/wiki-writer.md` |

**Rola:** Tworzy i aktualizuje strony w `wiki/`. Implementuje operacje INGEST/QUERY/LINT z CLAUDE.md.

---

### coder
| Parametr | Wartość |
|----------|---------|
| Model | `claude-opus-4-6` |
| Effort | high |
| Narzędzia | `Read, Write, Edit, Bash, Glob, Grep` |
| Plik | `.claude/agents/coder.md` |

**Rola:** Pisze i uruchamia kod. Opus z wysokim effort — precyzja i bezpieczeństwo są krytyczne.

---

### reviewer
| Parametr | Wartość |
|----------|---------|
| Model | `claude-sonnet-4-6` |
| Effort | medium |
| Narzędzia | `Read, Glob, Grep` |
| Plik | `.claude/agents/reviewer.md` |

**Rola:** Lint wiki, code review, weryfikacja sprzeczności. Tylko odczyt.

---

### note-taker
| Parametr | Wartość |
|----------|---------|
| Model | `claude-haiku-4-5` |
| Effort | low |
| Narzędzia | `Read, Write, Edit` |
| Plik | `.claude/agents/note-taker.md` |

**Rola:** Zapisuje co zadziałało/co nie w `wiki/notes/`. Buduje pamięć operacyjną siatki.

## Jak używać

### Wywołanie agenta ręcznie
W każdym momencie możesz użyć narzędzia Agent z `subagent_type` = nazwa agenta:

```
Użyj agenta dispatcher żeby zdecydować co zrobić z tym zadaniem: [...]
Użyj agenta coder żeby napisać skrypt który [...]
Użyj agenta note-taker żeby zapisać że podejście X nie zadziałało bo [...]
```

### Automatyczny routing
Napisz do głównej sesji co chcesz zrobić — Claude automatycznie dobierze agenta na podstawie `description` w pliku agenta (Claude Code dopasowuje opisy do zadania).

### Przepływ typowego zadania
```
1. dispatcher  → decyduje: coder
2. coder       → implementuje
3. reviewer    → sprawdza kod (opcjonalne)
4. note-taker  → zapisuje wnioski
```

## Optymalizacja kosztów

| Scenariusz | Bez siatki | Z siatką |
|------------|-----------|----------|
| Routing 10 zadań | 10× Opus | 10× Haiku (-90% koszt) |
| Ingest źródła | 1× Opus | Sonnet (~-60% koszt) |
| Pisanie kodu | 1× Sonnet | 1× Opus (+koszt, +jakość) |
| Notatki × 20 | 20× Sonnet | 20× Haiku (-80% koszt) |

Kluczowy insight: **Haiku na operacjach IO i routingu to największa oszczędność.** Opus tylko tam gdzie naprawdę liczy się głęboka analiza.

## Rozszerzanie siatki

Aby dodać nowego agenta:
1. Utwórz `.claude/agents/<nazwa>.md` z frontmatter `type: agent`, `model`, `tools`, `description`.
2. Dodaj wpis do tabeli Mapa agentów w `dispatcher.md`.
3. Dodaj do `wiki/index.md`.
4. Dopisz do `wiki/log.md`.

## Źródła

- [[concepts/llm-wiki-pattern]]
- [Claude Code Sub-Agents](https://code.claude.com/docs/en/sub-agents.md)
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams.md)
