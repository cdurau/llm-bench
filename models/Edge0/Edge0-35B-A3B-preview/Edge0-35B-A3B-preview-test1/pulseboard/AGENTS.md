# PulseBoard — AGENTS.md

## Überblick

PulseBoard ist eine minimalere persönliche Tagesübersicht als PWA (Progressive Web App). Nutzer können Aktivitäten/Gewohnheiten verwalten, deren täglichen Status abhaken und ihren Fortschritt auf einem Dashboard sehen.

## Projektstruktur

```
pulseboard/
├── index.html                  # PWA-Eintrittspunkt mit Manifest- und SW-Referenzen
├── vite.config.ts              # Vite + PWA-Konfiguration (Service Worker, Pre caching)
├── tsconfig.json               # TypeScript-Konfiguration (Strict-Mode)
├── vitest.config.ts            # Testing-Konfiguration (jsdom, Test-Setup)
├── package.json
├── public/
│   ├── icons/                  # PWA-Icons (SVG + generierte PNGs)
│   │   ├── icon-192.svg
│   │   ├── icon-512.svg
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json           # PWA-Manifest (Web App Manifest)
│   └── sw.js                   # Statischer Service Worker (Fallback)
├── src/
│   ├── main.tsx                # App-Einstieg (React 19 root.render)
│   ├── components/
│   │   ├── App.tsx             # Haupt-Layoutkomponente
│   │   ├── ActivityForm.tsx    # Formular zum Erstellen/Bearbeiten
│   │   ├── ActivityList.tsx    # Liste aller Aktivitäten (nach Kategorie gruppiert)
│   │   ├── ActivityItem.tsx    # Einzelne Aktivität mit Checkbox
│   │   ├── Dashboard.tsx       # Fortschrittsanzeige und Statistiken
│   │   ├── DayNavigation.tsx   # Datumsnavigation (Heute/Vorher/Nächster)
│   │   └── EmptyState.tsx      # Leer-Zustand für leere Listen
│   ├── hooks/
│   │   └── useActivities.ts    # Custom Hooks für Daten und Status
│   ├── utils/
│   │   ├── storage.ts          # localStorage (versioniert) — Lesen, Schreiben, Migration
│   │   └── date.ts             # Datumsformatierung und -analyse
│   ├── types/
│   │   └── index.ts            # TypeScript-Typdefinitionen
│   └── styles/
│       └── globals.css         # Globale Styles (CSS-Variablen, Dark Mode, Responsive)
└── tests/
    ├── setup.ts                # Test-Setup (localStorage-Mock, crypto-Mock)
    ├── storage.test.ts         # Persistenz-Tests (lesen, schreiben, Migration, corrupted data)
    ├── date.test.ts            # Datumsfunktionen
    ├── ActivityForm.test.tsx   # Formularkomponente (Validierung, edit mode)
    ├── ActivityList.test.tsx   # Aktivitätsliste (TOGGLE, Edit, Delete, Gruppierung)
    └── Dashboard.test.tsx      # Fortschrittsanzeige
```

## Technische Entscheidungen

| Entscheidung | Wahl | Begründung |
|---|---|---|
| Speichertechnik | localStorage | Einfache API, testbar, ausreichend für < 200 Aktivitäten |
| Schema-Version | 1 (aktiv) | storedData.version wird geprüft, ungültige Daten führen zu leerem Start |
| PWA-Icons | SVG + generierte PNGs | SVG für Entwickler, PNG für Installierbarkeit generiert |
| Design | CSS Custom Properties | Dark Mode via `prefers-color-scheme`, leicht anpassbar |
| Styling | Inline-CSS, keine Bibliothek | Kein Build-Overhead, < 7 KB gzip |

## Befehle

```bash
# Entwicklung
npm run dev

# Tests
npx vitest run

# TypeScript-Prüfung
npx tsc --noEmit

# Produktionsbuild
npx vite build

# Icons generieren (aus SVG-Quellen)
node generate-icons.cjs
```

## Architektur

### Datenfluss

1. **useActivities** — Verwaltet die Liste aller Aktivitäten in localStorage.
2. **useDayStatus** — Verwaltt den Abhak-Status pro Datum (Day → Activity → checked).
3. **localStorage** — Versionierte Datenstruktur (`StoredData` Schema v1).

### Datenstruktur

```typescript
interface Activity {
  id: string;           // crypto.randomUUID()
  name: string;
  description?: string;
  category: string;     // Gesundheit, Produktivität, Lernen, Soziales, Freizeit, Sonstiges
  dailyGoal?: number;   // Optionale Wiederholungen pro Tag
  createdAt: string;    // ISO-Datum der Erstellung
}

interface StoredData {
  version: number;
  activities: Activity[];
  dayStatus: Record<string, Record<string, boolean>>; // "YYYY-MM-DD" → { activityId: checked }
  createdAt: string;
  updatedAt: string;
}
```

### Migration / Ungültige Daten

- Ungültiges JSON → App startet leer
- Falsche Schema-Version → Daten werden ignoriert
- Fehlende Pflichtfelder werden mit Standardwerten ersetzt (name → "Ohne Titel", category → "Sonstiges")
- Ungültige `dailyGoal` (< 0) wird ignoriert

## Tests

46 Tests in 5 Testdateien:

- **storage.test.ts** (20 Tests) — Lesen, Schreiben, Schema-Validierung, Beschädigte Daten, Schnittstelle
- **date.test.ts** (7 Tests) — Formatierung, Anzeige
- **ActivityForm.test.tsx** (7 Tests) — Validierung, Formularfeld, Edit-Modus
- **ActivityList.test.tsx** (8 Tests) — Erstellen, Ändern, Löschen, Status, Gruppierung
- **Dashboard.test.tsx** (4 Tests) — Fortschritt, Statistiken

## PWA

- Manifest: `public/manifest.json` → `dist/manifest.json`
- Service Worker: `vite-plugin-pwa` generiert `dist/sw.js`
- App-Shell wird gecacht; App funktioniert offline
- Installierbar (Vorschau im Browser über Geräte-Steuerung → "PulseBoard installieren")

## Design

- **Typografie**: Inter (Google Fonts), fallback: system-ui
- **Farben**: CSS-Variablen mit `prefers-color-scheme: dark` Support
- **Responsive**: Mobile-first, max-width: 560px, ab 480px spezielle Anpassungen
- **Zugänglichkeit**: `aria-label`, `role`, Tastatur-Navigation (`focus-visible`), `prefers-reduced-motion`
