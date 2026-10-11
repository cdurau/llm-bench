# Rhythm

Ein ruhiger, offlinefähiger Habit- und Stimmungs-Tracker als PWA. Alle Daten bleiben
lokal auf dem Gerät (IndexedDB) – kein Konto, kein Backend, kein Tracking.

## Features

- **Heute:** Gewohnheiten per Tap abhaken, Datum und Fortschritt („2 von 3"), Streaks am Habit
- **Verwaltung:** Gewohnheiten anlegen, umbenennen, löschen, Emoji und Farbe wählen
- **Stimmung:** einmal pro Tag von 1–5 wählbar, mit optionaler Kurznotiz
- **Woche:** Chart der letzten 7 Tage (erledigte Habits pro Tag + Stimmungsverlauf)
- **Dark Mode:** folgt dem System, manuell umschaltbar, wird gespeichert
- **Offline:** nach dem ersten Laden komplett offline nutzbar, Daten bleiben erhalten
- **Installierbar:** Web-App-Manifest mit Icons (192/512, maskable), `display: standalone`

## Stack

- Vite + React + TypeScript (Template `react-ts`)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `vite-plugin-pwa` (Manifest + Workbox-Service Worker, `registerType: autoUpdate`)
- `idb` für IndexedDB
- Recharts für das Wochen-Chart
- `@phosphor-icons/react` für die Navigation

## Entwicklung

```bash
npm install
npm run dev        # PWA auch in der Dev-Umgebung aktiv
```

## Produktion

```bash
npm run build      # erzeugt dist/ inkl. Service Worker, Manifest, Icons
npm run preview    # lokale Vorschau der Produktion
```

## Werkzeuge

- `tools/generate-icons.mjs` – erzeugt die PNG-Icons (512/192/180) ohne native Abhängigkeit: `node tools/generate-icons.mjs`
- `tools/check-contrast.mjs` – prüft alle WCAG-Text- und Grafik-Kontrastpaare der App
- `tools/smoke.mjs` – automatisierter Runtime-Test (Playwright): rendert die App, durchspielt alle Kernfeatures
