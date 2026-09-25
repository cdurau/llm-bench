# PulseBoard – Projekt-Status

## Meilensteine

### [Erfüllt] Designplanung
- Designplan erstellt unter `design-plan.md`
- Jev-Entscheidungen: state-basiert (100 %), flache Aktivitätsliste (72 %)
- Farbschema: graues Warmweiß + reifes Teal #247065

### [Erfüllt] Projekt-Setup
- Vite + React 19 + TypeScript strict
- vite-plugin-pwa (V21) für PWA-Fähigkeiten
- vitest + @testing-library/react für Tests
- ESLint mit TypeScript ESLint

### [Erfüllt] Data-Layer
- Versionierte localStorage-Schicht mit Korruptions-Resilienz
- IDs generiert mit time+random

### [Erfüllt] Hooks
- `useDayData` – zustandslos, berechnet View-State aus appData
- `useActivities` – CRUD für Aktivitäten

### [Erfüllt] Komponenten
- ActivitiesPanel, ActivityForm (Modal), Dashboard, DayNavigator, CategoryFilter
- Alle im Designplan beschrieben

### [Erfüllt] Tests
- 3 Test-Dateien, 18 Tests
- Coverage: storage-layer, useDayData (toggle, delete, stats, isolation), useActivities (CRUD)

### [Erfüllt] Build-Verifikation
- Alle 36 Tests bestanden
- TypeScript strict: 0 Errors
- Production Build: 237 KiB precached, SW + Manifest generiert
- Dev-Server: 93 ms startup, alles kompiliert
- Linting: ESLint configured (type-checked, no-exhaustive-deps warn)

## Bekannte Einschränkungen (MVP)

- Kein Kategorie-Manager (erstellen/löschen von Kategorien nicht möglich)
- Kein Activity-Editieren (nur löschen und neu erstellen)
- Kein "Heute"-Button in der Kategorie-Ansicht
- Keine export/import-Funktion
- Kein Sync zwischen Tabs
