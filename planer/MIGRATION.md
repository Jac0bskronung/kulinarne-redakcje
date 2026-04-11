# Migracja UI z Single-Page App do React

## Skrót

Zmiana z monolitycznego `index.html` (924 linie) na strukturę React z UiStrony (https://github.com/Jac0bskronung/UiStrony).

## Co zostało zastąpione

| Kategoria | Stare | Nowe |
|-----------|-------|------|
| Struktura | Vanilla JS + HTML | React 19 + JSX |
| Styling | Tailwind inline | Tailwind + CSS modules |
| Komponenty | Embed w HTML | Modularne /src/components |
| UI Kit | custom | Radix UI (80+ komponenty) |
| Animacje | CSS keyframes | Framer Motion |
| Routing | History API | React Router v7 |

## Zachowane elementy

1. **Supabase klucze** (niezbędne dla połączenia z bazą danych)
   - Plik: `/src/lib/supabase.js`
   - Hook: `/src/hooks/useSupabase.js`
   
2. **Demo data** (logika wydatków i newsów)
   - HousingExpenses.jsx (statyczne dane o wydatkach)
   - LivingExpenses.jsx (statyczne dane)
   - AiNews.jsx (statyczne newsy z AI)

## Struktura projektu

```
planer/
├── public/
│   └── index.html (React entry point)
├── src/
│   ├── components/
│   │   ├── ui/          (80+ Radix UI primitives)
│   │   ├── Dashboard.jsx (main container)
│   │   ├── HousingExpenses.jsx
│   │   ├── LivingExpenses.jsx
│   │   └── AiNews.jsx
│   ├── hooks/
│   │   └── useSupabase.js (nowy)
│   ├── lib/
│   │   └── supabase.js (nowy)
│   ├── App.js (React router)
│   ├── index.js (React DOM)
│   └── index.css
├── package.json (@supabase/supabase-js dodane)
└── tailwind.config.js
```

## Pliki zmienionych

- `package.json` - dodano `@supabase/supabase-js`
- `src/lib/supabase.js` - NOWY (inicjalizacja Supabase)
- `src/hooks/useSupabase.js` - NOWY (hook dla bazy danych)

## Backup

Oryginalny index.html: `/planer/index.html.backup` (45 KB)

## Next steps

1. `npm install` - pobranie zależności
2. `npm start` - uruchomienie dev servera
3. Testowanie integracji z Supabase (dane na żywo zamiast hardcoded)
4. Migracja logiki digest (teraz w localhoście) do komponentów React
5. Setup CI/CD dla React build (zamiast CDN HTML)

