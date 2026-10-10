# Habit-Tracker-Benchmark („Rhythm")

Zweite Benchmark-Aufgabe im llm-bench-Projekt, nach PulseBoard. Ein lokales Coding-LLM baut aus einem festen Prompt einen kleinen, offlinefähigen Habit- und Stimmungs-Tracker als PWA. Im Fokus stehen die **Designqualität** und die Frage, wie gut der Agent Skills nutzt, insbesondere den optionalen Entscheidungs-Skill [Jev](https://www.skills.sh/okooo5km/jev/jev).

Struktur: pro Modell ein Ordner direkt unter diesem Verzeichnis (`tests/habit-tracker/<modellname>/`), nicht die Struktur `models/<family>/<model>/<model>-test<N>/` wie bei PulseBoard.

## Aufgabe in Kürze

- App: **Rhythm** mit Habits und Streaks, täglicher Stimmung (1 bis 5), Wochen-Chart, Dark Mode und Offline-Nutzung.
- Fester Stack: Vite, React, TypeScript, `vite-plugin-pwa`, Tailwind CSS v4, IndexedDB über `idb`, Recharts.
- Skills: `minimalist-ui` (Design), `vite-pwa-patterns` (PWA-Setup) und in Jev-Läufen zusätzlich `jev` (schnelle typisierte Entscheidungen per CLI).
- Fertig, wenn `npm run build` durchläuft und `npm run preview` die App zeigt.

Die komplette Aufgabe steht in [`habit_tracker_prompt.md`](./habit_tracker_prompt.md).

## Bewertungsdimensionen

Der finale App-Zustand allein reicht für den Vergleich nicht aus. Zusätzlich zur Feature-Abdeckung werden drei Qualitätsdimensionen bewusst getrennt dokumentiert:

- **Design / UX Quality:** visueller Eindruck, Hierarchie, Konsistenz, Responsive-Verhalten und mobile Nutzbarkeit.
- **First-Pass Technical Quality:** wie viel nach dem eigentlichen Build ohne Nutzerhinweise oder zusätzliche Reparatursessions tatsächlich funktioniert.
- **Repair Effort:** wie viele zusätzliche Agenten-Runden, Bugfix-Sessions oder Nutzer-Bugreports nötig sind, bis ein brauchbarer Endzustand erreicht ist.

Damit bleibt sichtbar, ob ein Modell beispielsweise ein stärkeres Design erzeugt, dafür aber viel technische Nacharbeit benötigt, oder ob es visuell einfacher arbeitet, dafür funktional fast sofort zuverlässig ist. Die vollständige Rubrik steht unterhalb des Trenners in `habit_tracker_prompt.md` und wird dem Modell nicht gezeigt.

## Dateien

| Datei | Zweck |
| --- | --- |
| `habit_tracker_prompt.md` | Benchmark-Prompt, darunter die Bewertungsrubrik |
| `habit_tracker_prompt_verify.md` | Variante mit Pflicht-`data-testid`s und Smoke-Test-Schritt (nicht direkt mit dem Originalprompt vergleichbar) |
| `tools/verify/` | Smoke-Test-Skript `verify.mjs` (Playwright) für die Variante, Einrichtung und Vertrag siehe dortiges README |
| `install-skills.sh` | Einfacher Installer: installiert alle drei Skills (inklusive Jev) in den aktuellen Ordner |
| `auto-install-skills.sh` | Konfigurierbarer Installer mit `-d <ordner>`, `--with-jev` und `--dry-run` (siehe `--help`) |
| `run-opencode-sandbox.sh` | Startet OpenCode V2 in Docker mit Schreibzugriff auf genau einen Modellordner |
| `run-pi-sandbox.sh` | Startet Pi (macOS, `sandbox-exec`) mit Schreibzugriff auf genau einen Modellordner |
| `<modellname>/` | Ein Lauf pro Modell: erzeugte App, `.agents/skills/` und `skills-lock.json` |

Beispiel: `gemma-4-26b-a4b-it-oQ8e-mtp/` (aktuell mit installierten Skills inklusive Jev). Die `skills-lock.json` im Run-Ordner zeigt, welche Skills im Lauf aktiv waren. Daran erkennst du auch, ob ein Lauf mit oder ohne Jev war.

## Einen Test durchführen

1. Modellordner anlegen: `mkdir <modellname>`
2. Skills hineininstallieren, aus diesem Verzeichnis:
   - ohne Jev: `./auto-install-skills.sh -d <modellname>`
   - mit Jev: `./auto-install-skills.sh -d <modellname> --with-jev`
3. Den Agenten (OpenCode) in `<modellname>/` starten, zum Beispiel mit der [Docker-Sandbox](#opencode-in-der-docker-sandbox-starten), und ihm den Prompt geben.
   - **Nur den Teil oberhalb des `---` einfügen.** Die Rubrik darunter ist für die Auswertung und darf dem Modell nicht gezeigt werden.
   - Bei einem Lauf **ohne Jev** zusätzlich den Abschnitt „Arbeitsweise mit Jev" und den Jev-Teil des abschließenden Zusammenfassungs-Satzes aus dem eingefügten Prompt entfernen.
4. Jev-Läufe brauchen Netzzugriff und `TYPESAFE_API_KEY` (oder außerhalb der Sandbox `OPENROUTER_API_KEY`) in der Shell, aus der der Agent gestartet wird. Die Sandbox reicht derzeit nur `TYPESAFE_API_KEY` weiter. Vor dem Lauf einmal testen: `jev yes "Ist 1 kleiner als 2?"`
5. Das erzeugte Ergebnis unverändert in Git sichern, auch wenn der Lauf scheitert (siehe [`AGENTS.md`](../../AGENTS.md)).
6. Für den manuellen Browser-Test **jeden Run auf einem eigenen Origin starten**, bevorzugt mit einem eigenen Vite-/Preview-Port. Alternativ vor dem Test IndexedDB, localStorage, Cache Storage und Service Worker für den Origin löschen. So beeinflussen Datenbanknamen oder Schema-Versionen eines vorherigen Modells den nächsten Lauf nicht.

## OpenCode in der Docker-Sandbox starten

`run-opencode-sandbox.sh` wird aus diesem Verzeichnis mit einem **bereits vorhandenen Modellordner** aufgerufen. Für einen neuen Lauf zum Beispiel:

```bash
mkdir mein-modell-run
./auto-install-skills.sh -d mein-modell-run
./run-opencode-sandbox.sh mein-modell-run
```

Für einen Jev-Lauf die Skills stattdessen mit `--with-jev` installieren und `TYPESAFE_API_KEY` vor dem Sandbox-Start in der Host-Shell exportieren. Dem Agenten anschließend nur den Promptteil oberhalb der Bewertungsrubrik geben. Geschlossene Modellläufe nicht erneut als Schreibziel verwenden.

Voraussetzungen sind ein laufender Docker-Daemon, ein aus dem Container erreichbarer oMLX-Server (Standard: `http://192.168.0.189:8000/v1`) und eine oMLX-Key-Datei (Standard: `~/.config/.secrets/omlx-key`). Das Docker-Image wird beim ersten Start automatisch gebaut. Die oMLX-Model-ID entspricht standardmäßig dem Ordnernamen; bei einem anderen Server-Modellnamen kann sie separat gesetzt werden:

```bash
OMLX_MODEL_ID=tatsaechliche-modell-id ./run-opencode-sandbox.sh mein-modell-run
```

Weitere Einstellungen sind `OMLX_BASE_URL`, `OMLX_KEY_FILE`, `CONTEXT_LIMIT` (Standard: `131072`) und `OUTPUT_LIMIT` (Standard: `16384`). Mit `REBUILD=1 ./run-opencode-sandbox.sh mein-modell-run` wird das Image neu gebaut. Zusätzliche Argumente hinter dem Ordnernamen werden an OpenCode weitergereicht.

Die Sandbox startet OpenCode mit `--standalone --auto` im Modellordner. Der gesamte Habit-Tracker-Bereich ist im Container lesbar; von den Host-Dateien ist nur der ausgewählte Modellordner beschreibbar. Terminal- und OpenCode-Logs werden unter `<modellname>/.sandbox-debug/` gespeichert.

## Pi mit Schreibsperre starten

`run-pi-sandbox.sh` startet Pi im Modellordner, ohne Docker. Es nutzt `sandbox-exec` (nur macOS) und verbietet das Schreiben im gesamten Home außer im Modellordner, `~/.pi`, `~/.npm` und `~/.cache`. Lesen, Netz, `npm` und andere Tools bleiben frei; `~/.ssh` und `~/.config/.secrets` sind zusätzlich zum Lesen gesperrt. Der Agent kann dadurch nicht außerhalb des Run-Ordners schreiben und auch nicht per `git` committen, weil `.git` im Repo-Root liegt.

```bash
./run-pi-sandbox.sh mein-modell-run
./run-pi-sandbox.sh mein-modell-run --model xyz   # weitere Argumente gehen an pi
```

Der Modellordner muss bereits existieren (inklusive installierter Skills) und unter diesem Verzeichnis liegen. Pi findet die Skills unter `<modellname>/.agents/skills/`, solange im Modellordner kein eigenes Git-Repo angelegt wird. Optionen per Umgebungsvariable:

- `PI_SANDBOX_EXTRA_RW="/pfad/a:/pfad/b"` macht weitere Pfade beschreibbar.
- `PI_SANDBOX_ALLOW_SECRETS=1` hebt die Sperre für `~/.config/.secrets` auf, falls Pi den Modell-Key von dort liest.
- `PI_SANDBOX_CMD=zsh` startet statt Pi einen anderen Befehl, zum Beispiel zum Testen der Sperre.

`sandbox-exec` ist von Apple als veraltet markiert, funktioniert aber weiterhin. Die Sperre betrifft nur Schreibzugriffe; ein unbeschränktes `find /` wird nicht verhindert.

## Vergleich

Pro Modell erlauben zwei Läufe mit sonst identischen Bedingungen (ohne Jev, mit Jev) einen sauberen Vergleich. Zu beachten: Jev-Läufe sind nicht mehr rein lokal, weil Jev die TypeSafe-API aufruft. Ergebnisse und Erkenntnisse werden in Notion dokumentiert, nicht in diesem Ordner. In der Datenbank **Benchmark Runs** wird dafür das Benchmark-Projekt „Habit-Tracker" gewählt und der Git-Pfad `tests/habit-tracker/<modellname>` eingetragen.

- Prompt-Seite: https://app.notion.com/p/3e98253ebb248154bfc2ed1a92e13f2d
- Projektseite: https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f
- Benchmark Runs: https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86
