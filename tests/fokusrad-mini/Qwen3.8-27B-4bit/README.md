# Fokusrad

„Fokusrad" ist eine kleine, ruhige, offlinefähige Progressive Web App: ein
5-Minuten-Gedanken-Shift-Tool nach dem Focus-Wheel-Prinzip. Man notiert einen
belastenden Ausgangsgedanken, ein Zielgefühl und acht überbrückende Sätze –
jeder Satz füllt ein Segment des SVG-Fokusrads, in dessen Zentrum der
Zielgedanke steht. Am Ende wird der Stimmungs-Shift (z. B. „2 → 4") sichtbar
gemacht; abgeschlossene Räder landen im Verlauf.

## Features

- **Neues Fokusrad:** Ausgangsgedanke, Zielgedanke, Start-Stimmung (1–5)
- **Aktive Session:** SVG-Fokusrad mit 8 Kreissegmenten, schrittweise
  Sätzeingabe (1–8), Fortschrittsanzeige, Bearbeiten/Löschen einzelner Sätze,
  ruhiger 5-Minuten-Timer
- **Abschluss:** End-Stimmung (1–5) mit sichtbarem Stimmungs-Shift
- **Archiv/Verlauf:** alle abgeschlossenen Räder mit Datum, Gedanken und
  Shift; Detailansicht mit vollem Rad; Löschen mit Bestätigung
- **Dark Mode:** Light / Dark / System, in `localStorage` gespeichert
- **Offline:** Service Worker (`vite-plugin-pwa`, `autoUpdate`) precacht die
  komplette App; Daten bleiben nach Neuladen erhalten
- **Persistenz:** versionierter `localStorage`-Zustand
  (`fokusrad:v1:state`, inkl. Entwurf/laufender Session); ungültige Daten
  werden bereinigt, statt die App zum Absturz zu bringen
- **Mobile-First:** 375 px breit bedienbar, `dvh`-Layout, Safe-Area-Insets,
  16-px-Inputs, 44-px-Touch-Ziele, Hover-Styles nur auf
  `(hover: hover)`-Geräten, zentrierte schmale Spalte auf Desktop

## Stack

- Vite + React + TypeScript (`react-ts`-Template)
- Tailwind CSS v4 (`@import "tailwindcss"`, `@tailwindcss/vite`)
- `vite-plugin-pwa` (Manifest, Service Worker, `registerType: autoUpdate`)
- `lucide-react` für Iconografie

## Entwicklung

```bash
npm install
npm run dev        # Entwicklung (PWA-Dev-Optionen deaktiviert)
npm run build      # Produktion (erzeugt dist/, inkl. Service Worker + Manifest)
npm run preview    # lokale Vorschau des Builds
npm run lint       # oxlint
```

## Icons

Die App-Icons (`public/`) werden aus einem kleinen Skript erzeugt, das
PNG-Dateien rein mit `node:zlib` rendert:

```bash
node scripts/generate-icons.mjs
```

Es erzeugt `favicon.svg`, `icons/icon*.png|svg` (192/512, plus maskable)
und `apple-touch-icon.png`.

## Projektstruktur

```
src/
  types.ts                 # Datenmodell (FocusWheel, AppState, Stimmung)
  storage.ts               # versionierte localStorage-Schicht + Sanitisierung
  theme.ts                 # Theme-Auflösung (Light/Dark/System) + theme-color
  format.ts                # deutsche Datums-Formate
  App.tsx                  # Zustand, Persistenz, Ansichtsführung, Kopf, Navigation
  components/
    FocusWheelSvg.tsx      # SVG-Rad: 8 Segmente + Zielgedanken-Zentrum
    MoodScale.tsx          # 5-Punkte-Stimmungsskala
    MoodShift.tsx          # „2 → 4"-Darstellung
    ThemeToggle.tsx        # Light / Dark / System
    BottomNav.tsx          # Tab-Navigation (Fokusrad / Verlauf)
    WheelGlyph.tsx         # kleines Rad-Emblem
  views/
    HomeView.tsx           # Begrüßung, Weitermachen-Karte, Neuanfang
    NewWheelView.tsx       # Start-Formular
    SessionView.tsx        # aktive Session
    CompleteView.tsx       # End-Stimmung + Shift
    ArchiveView.tsx        # Verlauf
    DetailView.tsx         # Detailansicht + Löschen
public/                    # Icons (via scripts/generate-icons.mjs)
scripts/generate-icons.mjs # Icon-Generator (reines Node)
```
