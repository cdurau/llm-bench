# PulseBoard — Projektanweisungen

## Was ist das?

PulseBoard ist eine PWA für eine persönliche Tagesübersicht. Nutzer erstellen kleine Aktivitäten (Gewohnheiten, Aufgaben), haken sie für den aktuellen Tag ab und sehen ihren Fortschritt.

## Projektstruktur

```
├── index.html                    # HTML-Shell
├── public/
│   ├── favicon.svg               # SVG-Icon für PWA
│   └── manifest.json             # Web App Manifest
├── src/
│   ├── main.tsx                  # Einstiegspunkt
│   ├── App.tsx                   # Haupt-Shell, State-Owner
│   ├── index.css                 # Design-System (Custom Properties)
│   ├── types.ts                  # TS-Typen
│   ├── constants.ts              # Konstanten
│   ├── lib/
│   │   ├── storage.ts            # Versionierte localStorage-Layer
│   │   ├── generateId.ts         # ID-Generator
│   │   └── storage.ts            # (oben)
│   ├── hooks/
│   │   ├── useLocalStorage.ts    # Generischer localStorage-Hook
│   │   ├── useDayData.ts         # Berechneter Day-State (tab, Date, Kategorie, Stats)
│   │   └── useActivities.ts      # CRUD für Aktivitäten
│   ├── components/
│   │   ├── ActivitiesPanel.tsx   # Liste mit Checkbox + Delete
│   │   ├── ActivityForm.tsx      # Modal-Formular (Hinzufügen)
│   │   ├── Dashboard.tsx         # Statistiken + Kategorie-Balken
│   │   ├── DayNavigator.tsx      # ◀ Tag ▶ Navigation
│   │   └── CategoryFilter.tsx    # Kategorie-Filter
│   └── tests/
│       ├── setup.ts              # vitest + RTL setup
│       ├── storage.test.ts       # Versionierter Speicher-Layer
│       ├── useDayData.test.ts    # Day-State, Toggles, Stats
│       └── useActivities.test.ts # CRUD-Operationen
├── vite.config.ts                # Vite + PWA (vite-plugin-pwa)
├── vitest.config.ts              # Test-Konfiguration
├── eslint.config.mjs             # TypeScript ESLint
└── tsconfig.json                 # Strict TypeScript
```

## Architekturregeln

1. **Kein Router.** Die Navigation ist ein Tab-State (`'aktivitäten' | 'dashboard'`) in App.tsx.
2. **useDayData ist zustandslos** – es berechnet aus `appData` + Options den View-State. Der Parent (`App.tsx`) hält den State.
3. **localStorage ist der einzige Speicher.** Kein IndexedDB, kein Backend. Versioniert über `pulseboard:data:v1`.
4. **Keine UI-Bibliothek.** Alle Stile sind CSS Custom Properties + klassisches CSS.
5. **Dark Mode** via `@media (prefers-color-scheme: dark)` – Umschalter nicht nötig für MVP.
6. **Keine Animationen** außer dem progress bar width-transition (300ms, keine scatter-effe).

## Gebräuchliche Befehle

```bash
npm run dev            # Vite-Dev-Server
npm run build          # TypeScript + Production-Build
npm run test           # vitest – einmal ausführen
npm run test:watch     # vitest – Watch-Modus
npm run lint           # ESLint über src/
```

## Datenträger

- **localStorage Schlüssel:** `pulseboard:data:v1`
- **Speicherversion:** `CURRENT_VERSION` in `constants.ts`
- **Format:** `{ version, activities: [], completions: [{ date, completions: {} }] }`
- **Korruption:** `load()` fängt JSON-Parsing-Fehler ab und startet mit leerem Zustand.

## Designprinzipien (aus design-plan.md)

- Ruhig, kein Gamification. Rotes "Du hast 3 verpasst!" nicht vorhanden.
- Abgehakte Einträge bleiben sichtbar (durchgestrichen), nicht "verschwinden".
- Eine dünne horizontale Teal-Akzentlinie am Header als visuelle Signatur.
- Kein Shadrad-Kits, kein Warm-Plus-Terrakotta.
- Inter als einziger Typeface.
- Mobile-first: Touch-Targets min. 44px, FAB unten rechts.

## Commit-Richtlinien

- Linting und Tests müssen nach jeder Änderung grün sein.
- Keine geleakten `console.log` in produktivem Code.
- Keine ungenutzten Imports.
