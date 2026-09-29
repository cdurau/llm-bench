# Habit-Tracker-Benchmark („Rhythm")

Zweite Benchmark-Aufgabe im llm-bench-Projekt, nach PulseBoard. Ein lokales Coding-LLM baut aus einem festen Prompt einen kleinen, offlinefähigen Habit- und Stimmungs-Tracker als PWA. Im Fokus stehen die **Designqualität** und die Frage, wie gut der Agent Skills nutzt, insbesondere den optionalen Entscheidungs-Skill [Jev](https://www.skills.sh/okooo5km/jev/jev).

Struktur: pro Modell ein Ordner direkt unter diesem Verzeichnis (`tests/habit-tracker/<modellname>/`), nicht die Struktur `models/<family>/<model>/<model>-test<N>/` wie bei PulseBoard.

## Aufgabe in Kürze

- App: **Rhythm** mit Habits und Streaks, täglicher Stimmung (1 bis 5), Wochen-Chart, Dark Mode und Offline-Nutzung.
- Fester Stack: Vite, React, TypeScript, `vite-plugin-pwa`, Tailwind CSS v4, IndexedDB über `idb`, Recharts.
- Skills: `minimalist-ui` (Design), `vite-pwa-patterns` (PWA-Setup) und in Jev-Läufen zusätzlich `jev` (schnelle typisierte Entscheidungen per CLI).
- Fertig, wenn `npm run build` durchläuft und `npm run preview` die App zeigt.

Die komplette Aufgabe steht in [`habit_tracker_prompt.md`](./habit_tracker_prompt.md).

## Dateien

| Datei | Zweck |
| --- | --- |
| `habit_tracker_prompt.md` | Benchmark-Prompt, darunter die Bewertungsrubrik |
| `install-skills.sh` | Einfacher Installer: installiert alle drei Skills (inklusive Jev) in den aktuellen Ordner |
| `auto-install-skills.sh` | Konfigurierbarer Installer mit `-d <ordner>`, `--with-jev` und `--dry-run` (siehe `--help`) |
| `<modellname>/` | Ein Lauf pro Modell: erzeugte App, `.agents/skills/` und `skills-lock.json` |

Beispiel: `gemma-4-26b-a4b-it-oQ8e-mtp/` (aktuell mit installierten Skills inklusive Jev). Die `skills-lock.json` im Run-Ordner zeigt, welche Skills im Lauf aktiv waren. Daran erkennst du auch, ob ein Lauf mit oder ohne Jev war.

## Einen Test durchführen

1. Modellordner anlegen: `mkdir <modellname>`
2. Skills hineininstallieren, aus diesem Verzeichnis:
   - ohne Jev: `./auto-install-skills.sh -d <modellname>`
   - mit Jev: `./auto-install-skills.sh -d <modellname> --with-jev`
3. Den Agenten (opencode) in `<modellname>/` starten und ihm den Prompt geben.
   - **Nur den Teil oberhalb des `---` einfügen.** Die Rubrik darunter ist für die Auswertung und darf dem Modell nicht gezeigt werden.
   - Bei einem Lauf **ohne Jev** zusätzlich den Abschnitt „Arbeitsweise mit Jev" und den Jev-Teil des abschließenden Zusammenfassungs-Satzes aus dem eingefügten Prompt entfernen.
4. Jev-Läufe brauchen Netzzugriff und `TYPESAFE_API_KEY` (oder `OPENROUTER_API_KEY`) in der Shell, aus der der Agent gestartet wird. Vor dem Lauf einmal testen: `jev yes "Ist 1 kleiner als 2?"`
5. Das erzeugte Ergebnis unverändert in Git sichern, auch wenn der Lauf scheitert (siehe [`AGENTS.md`](../../AGENTS.md)).
6. Für den manuellen Browser-Test **jeden Run auf einem eigenen Origin starten**, bevorzugt mit einem eigenen Vite-/Preview-Port. Alternativ vor dem Test IndexedDB, localStorage, Cache Storage und Service Worker für den Origin löschen. So beeinflussen Datenbanknamen oder Schema-Versionen eines vorherigen Modells den nächsten Lauf nicht.

## Vergleich

Pro Modell erlauben zwei Läufe mit sonst identischen Bedingungen (ohne Jev, mit Jev) einen sauberen Vergleich. Zu beachten: Jev-Läufe sind nicht mehr rein lokal, weil Jev die TypeSafe-API aufruft. Ergebnisse und Erkenntnisse werden in Notion dokumentiert, nicht in diesem Ordner. In der Datenbank **Benchmark Runs** wird dafür das Benchmark-Projekt „Habit-Tracker" gewählt und der Git-Pfad `tests/habit-tracker/<modellname>` eingetragen.

- Prompt-Seite: https://app.notion.com/p/3e98253ebb248154bfc2ed1a92e13f2d
- Projektseite: https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f
- Benchmark Runs: https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86
