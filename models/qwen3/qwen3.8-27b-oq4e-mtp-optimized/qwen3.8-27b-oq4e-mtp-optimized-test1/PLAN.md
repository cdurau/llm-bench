# PulseBoard — Plan

Planung, Design-Konzept und Architektur für die PulseBoard-PWA.
Entscheidungslog (Jev) am Ende. Status nach Meilensteinen: [STATUS.md](./STATUS.md).

## 1. Produkt

Persönliche Tagesübersicht: kleine Aktivitäten/Gewohnheiten anlegen, sie für jeden
Kalendertag abhaken, Fortschritt und eine Kategorie-Übersicht sehen. Kein Backend,
keine externen Webdienste, lokal gespeichert, offline nutzbar, installierbar.

### Kern-Semantik

- Eine **Aktivität** ist global: `name`, optionale `beschreibung`, `kategorie`
  (Freitext mit Vorschlägen), optionales `tagesziel` (ganze Zahl ≥ 1).
- Das **Tagesziel** steuert die Abhak-Mechanik: Ziel 1 (Standard) = einmal
  abhaken. Ziel > 1 = pro Klick wird gezählt, bei Erreichen des Ziels ist die
  Aktivität „erledigt“, ein weiterer Klick setzt auf 0 zurück.
- **Tagesstatus** = Zahl pro Aktivität pro Datum (`YYYY-MM-DD`, lokale Zeit).
  Kalendertage überschreiben sich nie, weil Status strikt nach Datum Schlüssel wirkt.
- **Zukünftige Tage** dürfen angezeigt, aber nicht abgehakt werden (UI gesperrt
  und Reducer lehnt Toggle für `Datum > heute` ab).
- Erledigt = `count >= tagesziel`. Fortschritt % = erledigt / gesamt (0 bei leer).

## 2. Design (Skill: frontend-design)

### Konzept: „Ruhiges Instrument“

PulseBoard soll sich anfühlen wie ein ruhiges, privates Messinstrument — nicht wie
ein SaaS-Dashboard. Das eine mutige Element ist die **Pulslinie**: eine schmale
EKG-ähnliche Linie im Kopfbereich, deren durchgezogener Anteil der Tagesfortschritt
ist (ein QRS-Spitz im Mittel, flach davor und danach). Alles andere bleibt leise:
Haarlinien statt Karten-Schatten, eine Spalte, viel Weißraum. Mut an genau einer
Stelle, Disziplin drumherum.

Der „Hero“ ist keine große Zahl, sondern der Tag selbst: Datum in Serif, darunter
die Pulslinie, darunter eine schmale Instrumenten-Anzeige (Erledigt / Offen /
Fortschritt) — und direkt die Liste.

### Farbe (Design-Tokens, je Modus 6 Werte)

| Name      | Hell        | Dunkel      | Verwendung                          |
|-----------|-------------|-------------|-------------------------------------|
| `--paper` | `#F4F4F1`   | `#141614`   | Seitenhintergrund (kühles, kaum getöntes Papier — bewusst nicht Creme) |
| `--surface` | `#FFFFFF` | `#1C1F1C`   | Panels, Dialog                       |
| `--ink`   | `#191C1A`   | `#E6E8E3`   | Haupttext                            |
| `--ink-soft` | `#6A716B` | `#969C93`  | Zweittext, Labels                    |
| `--pulse` | `#0E7A66`   | `#54BFA2`   | Akzent: Fortschritt, Fokus, Erledigt (ruhiges Teal, kein Säuregrün) |
| `--danger` | `#B23A2A`  | `#E0785F`   | Löschen, Fehler                      |
| `--line`  | `#E1E3DD`   | `#2A2E29`   | Haarlinien                           |

Dark Mode via `prefers-color-scheme` (keine manuelle Schaltung — weniger UI, ruhiger).

### Typografie (nur System-Stacks — keine externen Webdienste)

- **Serif** für das Datum (`"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`):
  das „private, menschliche“ Element; bewusst kein Hochkontrast-Display-Look,
  sondern eine ruhig gesetzte Datumszeile.
- **Sans** für UI und Fließtext (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
- **Mono** nur für Zahlen/Daten (`ui-monospace, "SF Mono", "Cascadia Mono", Menlo, monospace`):
  Fortschritt, Zähler `2/3`, Prozent — tabellarische, instrumentelle Lesart.
- Skala: Datum 30 px, Titel 17–18 px, Body 15–16 px, Labels 13 px (Satzzeichen, keine Großbuchstaben).

### Layout

Eine Spalte, max. 680 px, zentriert; auf Desktop mehr Rand statt Spalten.
Links ausgerichtet; keine Karten-Kits, Struktur = Haarlinien + Abstände.

```
┌────────────────────────────────────┐
│ PulseBoard                         │  Wortmarke + (ggf. Update-Button)
├────────────────────────────────────┤
│ Donnerstag, 27. September          │  Serif-Datum
│ ‾‾‾‾‾‾⌐↯↙‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾  │  Pulslinie: prozentual gefüllt
│ Erledigt 12  Offen 8  Fortschritt 60 % │  Mono-Anzeige, Haarlinie getrennt
├────────────────────────────────────┤
│ ‹   Heute   ›                      │  Tagesnavigation
├────────────────────────────────────┤
│ (o) Morgens laufen          2/3    │
│ (o) E-Mails aufräumen            ⚙ ✕ │  Zeilen, Haarlinien, keine Karten
│ (o) 8 Gläser Wasser        5/8      │
├────────────────────────────────────┤
│ Nach Kategorie                     │
│ Gesundheit ▬▬▬▬▬▬▯▯▯ 2/4          │  schmale Fortschrittsbalken
│ Haushalt   ▬▬▬▬▬▬▬▬▬▬ 1/1          │
├────────────────────────────────────┤
│ [ Aktivität hinzufügen ]           │  Primäraktion
└────────────────────────────────────┘
```

### Prinzipien

1. Eine Spalte, kein Karten-Kits; Haarlinien statt Schatten.
2. Ein mutiges Element: die Pulslinie. Sonst Ruhe.
3. Drei Typ-Stimmen mit klaren Aufgaben: Serif = Tag, Mono = Zahl, Sans = alles andere.
4. Bewegung nur als Antwort auf eine Aktion (Dialog, Toast, Checkbox-Zustand);
   `prefers-reduced-motion` wird respektiert.
5. Vollständige Tastaturbedienung, sichtbarer Fokus (2 px `--pulse`, Offset 2).
6. Texte: deutsche Alltagssprache, Satzzeichen, aktiv, konkrete CTAs
   („Speichern“, „Aktivität hinzufügen“), Fehler erklären Ursache + Weg.

### Self-Critique (Review gegen die Skill-Tells)

- Creme+Serif+Terrakotta: nicht verwendet (kühles Papier, Teal-Akzent, Serif nur als ruhige Datumszeile). ✓
- Säuregrün auf Schwarz: Akzent ist gedämpftes Teal in beiden Moden. ✓
- Karten-Kit mit identischem Radius & weichem Grau-Schatten: keine Karten, keine Schatten. ✓
- ALL-CAPS-Eyebrows, „·“-Metazeichen, „→“ in Buttons: bewusst vermieden. ✓
- Mono für Mini-Labels: nur für echte Datenwerte (Zähler, %), funktional begründet. ✓

## 3. Architektur

### Stack (jev-entschieden, siehe unten)

React 19 + TypeScript (strict) + Vite, **vite-plugin-pwa** (generateSW, `registerType: 'prompt'`),
**Vitest + React Testing Library** (jsdom) als primäre Testebene, **handgeschriebenes CSS**
mit Design-Tokens, **localStorage** als Speicher (versioniertes JSON-Dokument),
**useReducer + Context** für Zustand, **Tag in der URL-Hash** (`#/2026-09-27`),
**Kategorien als Freitext** mit `datalist`-Vorschlägen.

### Datenmodell & Persistenz

```ts
type Activity = { id, name, description, category, target, createdAt }
type AppData  = { version: 1, activities: Activity[],
                  progress: Record<'YYYY-MM-DD', Record<activityId, count>> }
```

- Speicher-Schlüssel: `pulseboard:data`. `SCHEMA_VERSION = 1`.
- `load()`: JSON parsen → Feld-für-Feld validieren/normalisieren (Whitelist).
  - Gültig → Daten; `version < SCHEMA_VERSION` → Migration (v1: Durchlauf),
    Flag `migrated`.
  - Teilweise ungültig → Einträge sanitize (leerer Name → entfernen,
    Ziel nicht ganzzahlig → 1, unbekannter Progress-Eintrag → verwerfen).
  - Komplett ungültig/nicht lesbar → leerer Zustand, Flag `corrupt`,
    sichtbares Banner; App **crasht nie**. Das kaputte Blob wird erst
    überschrieben, wenn der Nutzer tatsächlich etwas ändert.
- `save()`: synchron schreiben; Fehler (z. B. Quota) → Fehler-Toast, kein Crash.

### Zustandsfluss

```
URL-Hash ──► useSelectedDay() ──► <App>
localStorage ──► load() ──► useReducer(store) ──► save() (bei Änderung)
                                   │
          Aktionen: activity/add|update|delete, progress/toggle|decrement,
                    data/replace (Reset bei corrupt)
```

- Toggle-Aktion prüft `!isFuture(date)`, sonst no-op (zweite Verteidigung neben der UI).
- Zähl-Semantik: `count >= target → 0`, sonst `count + 1` (max. `target`).
- Selectoren (`statsForDay`, `categoryStats`) sind pure, getestete Funktionen.

### PWA

- Manifest via vite-plugin-pwa: Name, `lang: de`, `display: standalone`, Theme/
  Background-Farbe, Icons 192/512 + maskable.
- Icons: per Node-Skript (`scripts/generate-icons.mjs`) deterministisch
  erzeugte Platzhalter-PNGs (reines zlib, keine externen Dienste):
  Teal-Fläche mit weißer Pulslinie.
- Service Worker: generateSW, Precache der Build-Ausgabe, `navigateFallback`
  auf `index.html` → App-Shell offline. Update-Flow: `registerType: 'prompt'`
  → kleiner „Neu laden“-Button, wenn eine neue Version wartet.
- `main.tsx` hält die PWA-Registrierung aus (`src/pwa.ts`); Tests alisen
  `virtual:pwa-register` auf ein Stub.

### Tastatur & a11y

- Alle Aktionen Buttons; Fokus `:focus-visible` (2 px `--pulse`).
- Zeile: Toggle-Button (Kreis, `aria-label` mit Status), Bearbeiten-,
  Löschen-Button (`aria-label`).
- Dialog: natives `<dialog>` (showModal), Esc schließt, Fokus springt ins
  erste Feld, gilt für Add und Edit.
- Toast-Region `aria-live="polite"`; Banner `role="status"`.
- reduzierte Bewegung: `prefers-reduced-motion` deaktiviert Transitions.

### Projektstruktur

```
├── AGENTS.md            Projekt-Anweisungen (Eintrag für künftige Agenten)
├── PLAN.md              diese Datei
├── STATUS.md            Meilenstein-Log + Stand + Erinnerungen
├── index.html
├── package.json / tsconfig*.json / vite.config.ts / eslint.config.js
├── scripts/generate-icons.mjs
├── public/              favicon.svg, icons/*.png
└── src/
    ├── main.tsx / App.tsx / pwa.ts / styles.css
    ├── lib/             types.ts, dates.ts, storage.ts
    ├── state/           store.ts (reducer+selectoren), Provider.tsx, Toasts.tsx
    ├── hooks/           useSelectedDay.ts
    ├── components/      DayHeader, PulseLine, ActivityList/Row,
    │                    ActivityDialog, CategoryOverview, EmptyState, Banner
    └── test/            setup.ts, pwa-stub.ts
    (Tests liegen daneben: *.test.ts / *.test.tsx)
```

## 4. Testplan (Vitest + RTL)

| Anforderung | Test |
|---|---|
| Erstellen | `store.test.ts` (add) + `App.test.tsx` (Dialog: valides Formular erzeugt Zeile) |
| Bearbeiten | update im Reducer + Dialog-Flow (Name/Ziel ändern) |
| Löschen | delete im Reducer + Dialog/Zeilen-Flow, Bestätigung, Zeile verschwindet |
| Tagesstatus | toggle: zählen bis Ziel, Reset nach Ziel; pro Tag isoliert |
| Datumswechsel | navigation ähert Hash; Status je Tag erhalten; **zukünftiger Tag: Toggle gesperrt** (UI + Reducer) |
| Persistenz | after unmount/remount (gleicher localStorage) bleibt alles; `storage.test.ts` Roundtrip |
| Beschädigte Daten | `storage.test.ts`: kaputtes JSON, falsche Version, teils ungültig, exotische Typen → kein Crash, Banner, leere/gerettete Daten |
| Datumshilfen | `dates.test.ts`: Key-Formatierung, addDays, isFuture, gültig/ungültig |

Qualitäts-Gates: `tsc -b` (strict), `eslint .`, `vitest run`, `vite build` —
alle grün, dazu manuelle Verifikation gegen `vite preview` (inkl. Offline/
Service-Worker-Check im Browser).

## 5. Meilensteine

- **M0** Plan + Design-Konzept (diese Datei) ✅
- **M1** Scaffold: Configs, Install, Icons-Skript, PWA-Basis
- **M2** Domäne: Types, Dates, Storage, Store/Reducer + Unit-Tests
- **M3** UI: Komponenten, Styles, a11y, Empty States, Dark Mode
- **M4** Integrationstests (CRUD, Tag, Persistenz, Corruption)
- **M5** Gates: Lint, Typecheck, Build, Preview-Verifikation, Docs final

## 6. Entscheidungslog (Jev, 2026-09-27)

Schema: `jev pick "FRAGE" "OPTION_A" "OPTION_B" -s "KONTEXT"`

| Frage | Ergebnis | Entscheidung |
|---|---|---|
| localStorage vs IndexedDB | IndexedDB 0.67, conf **0.34** (schwaches Signal) | **localStorage** — Playbook: bei niedriger Confidence nach Risiko entscheiden. Kleiner Datensatz, synchrone API, einfach zu validieren, Requirements erlauben beides. IndexedDB brächte async-Plumbing und mehr Fehlerflächen ohne Nutzen für diese Größe. |
| PWA-Setup | vite-plugin-pwa, conf 1.00 | **vite-plugin-pwa** |
| State | reducer, conf 0.78 | **useReducer + Context** (keine extra Dependencies, pur testbar) |
| Styling | css-tokens, conf 1.00 | **handgeschriebenes CSS** mit Tokens |
| Test-Ebene | vitest-rtl, conf 1.00 | **Vitest + RTL** (Playwright optional später) |
| Tag verwalten | url-hash, conf 0.90 | **Tag im URL-Hash** (Deep-Link, Reload behält Tag, Back/Forward funktioniert) |
| Kategorien | free, conf 0.96 | **Freitext + datalist** (persönliche App, eigene Kategorien; Übersicht bleibt lesbar) |
