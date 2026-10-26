# Rhythm

Ein ruhiger, offlinefähiger Habit- und Stimmungs-Tracker als installierbare PWA.

## Funktionen

- **Heute:** Habits per Tap abhaken, Tagesfortschritt („3 von 5“), Datum.
- **Stimmung:** einmal pro Tag 1–5 mit Emojis, optionale Kurznotiz.
- **Streaks:** aktuelle und längste Serie pro Habit.
- **Woche:** Chart der letzten sieben Tage (erledigte Habits + Stimmungsverlauf).
- **Verwalten:** Habits anlegen, umbenennen, löschen, Emoji und Farbe wählen.
- **Dark Mode:** folgt dem System, manuell umschaltbar, Auswahl gespeichert.
- **Offline:** nach dem ersten Laden vollständig nutzbar; alle Daten bleiben lokal.

## Stack

| Zweck | Technologie |
| --- | --- |
| Build | Vite + React + TypeScript |
| Styling | Tailwind CSS v4 |
| PWA | `vite-plugin-pwa` (Manifest, Service Worker, Icons 192/512) |
| Persistenz | IndexedDB über `idb` |
| Diagramme | Recharts (lazy geladen) |

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server
npm run build    # Produktions-Build (tsc + vite)
npm run preview  # Build lokal ansehen
```

Alle Daten liegen ausschließlich auf dem Gerät in der IndexedDB-Datenbank
`rhythm`. Es gibt kein Backend und kein Konto.