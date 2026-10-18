# Rhythm — Habit- & Stimmungs-Tracker (PWA)

Offline-first Progressive Web App für Habits, Streaks und tägliche Stimmung.
Gebaut mit Vite, React, TypeScript, Tailwind CSS v4, `idb` (IndexedDB) und
`vite-plugin-pwa`. Recharts liefert das Wochen-Chart.

## Features

- **Heute:** Habits pro Tag abhaken mit sanfter Animation; Datum + Fortschritt „3 von 5"
- **Habits verwalten:** anlegen, umbenennen, löschen; Symbol (Emoji) und Farbe wählen
- **Streaks:** aktuelle und längste Serie pro Habit
- **Stimmung:** 1–5 pro Tag (mit Symbolen) + optionale Kurznotiz
- **Woche:** Chart der letzten 7 Tage (erledigte Habits + Stimmungsverlauf)
- **Dark Mode:** folgt dem System, manuell umschaltbar, persists in localStorage
- **Offline:** nach dem ersten Laden komplett offline nutzbar (Service Worker + Precache)
- **Leerzustände** sinnvoll gestaltet

## Commands

```bash
npm install       # Dependencies installieren
npm run dev       # Dev-Server
npm run build     # TypeScript-Check + Production-Build → dist/
npm run preview   # Production-Build lokal previewen
```

## Struktur

- `src/lib/db.ts` — IndexedDB-Schicht über `idb`
- `src/lib/date.ts`, `src/lib/streaks.ts`, `src/lib/colors.ts` — Hilfslogik
- `src/hooks/` — `useData` (Daten), `useDarkMode` (Erscheinungsbild), `usePWA` (Installation)
- `src/components/` — `Today`, `Week`, `Settings`, `HabitRow`, `HabitForm`, `Mood`, `Layout`, `EmptyState`, `icons`
- `public/icons/` — App-Icons (192/512)
- `vite.config.ts` — PWA-Konfiguration (Manifest + Service Worker, autoUpdate)
