# Rhythm

Kleine, offlinefähige PWA: Habit- und Stimmungs-Tracker. Alle Daten liegen lokal in
IndexedDB – kein Backend, kein Account.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- vite-plugin-pwa (Manifest, Service Worker, Icons 192/512 + maskable)
- `idb` (IndexedDB), Recharts (Wochen-Chart)

## Entwicklung

```sh
npm install
npm run dev
```

## Produktion

```sh
npm run build
npm run preview
```

Nach dem ersten Laden ist die App komplett offline nutzbar; ein Update des
Service Workers wird automatisch aktiviert (`registerType: 'autoUpdate'`).

## Icons

Die PWA-Icons werden von `scripts/generate-icons.mjs` erzeugt (reines Node,
ohne Abhängigkeiten):

```sh
node scripts/generate-icons.mjs
```
