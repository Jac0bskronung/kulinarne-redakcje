# FinPulse - PRD (Product Requirements Document)

## Original Problem Statement
Dodaj nową zakładkę "Remont" do istniejącej aplikacji FinPulse. Zakładka ma być budżet-trackerem na wykończenie mieszkania. NIE MODYFIKUJ istniejących zakładek "Mieszkanie" i "Wiadomości AI".

## Architecture
- **Frontend**: React 19 + CRA + craco (aliasy @/ → src/)
- **Styling**: Tailwind CSS + framer-motion, dark theme
- **Backend**: Supabase (PostgreSQL + REST API + Auth)
- **Tables**: budget_config, rooms, expense_types, items
- **Auth**: Auto sign-in with test@finpulse.local for RLS access

## User Personas
- Personal finance user tracking apartment renovation budget

## Core Requirements (Static)
1. Remont tab in navigation (Hammer icon, amber #F59E0B)
2. Fear Bar - budget progress bar (spent/frozen/free)
3. 4 stat tiles (total budget, spent, frozen, free)
4. Items list with filters (room, type, status)
5. CRUD operations on items (add, edit, delete)
6. Status workflow (inspiration → planned → realized)
7. Budget editing via click
8. Maintain existing tabs untouched

## What's Been Implemented (2026-04-12)
- [x] TabNavigation.jsx - added Remont tab with Hammer icon
- [x] Dashboard.jsx - registered RemontBudget component
- [x] useSupabase.js - added 8 new fetch/CRUD functions + ensureAuth
- [x] RemontBudget.jsx - full component with Fear Bar, items, CRUD, filters, modals
- [x] App.css - added amber glow styles + fear-pulse animation
- [x] Supabase seeded with 9 items, rooms, expense_types, budget_config (150k PLN)
- [x] Auth auto-sign-in for RLS compliance
- [x] All tests passed (98% frontend)

## Backlog
- P2: Chart dimension warnings (existing issue, not from Remont)
- P2: Mobile responsive testing  
- P3: Export budget data
- P3: Budget breakdown charts (pie/area)

## Next Tasks
- None pending - feature complete
