# Fokusrad-Mini-Benchmark („Fokusrad")

Kompakte Benchmark-Aufgabe im `llm-bench`-Projekt: Ein lokales Coding-LLM baut aus einem festen Prompt eine kleine, ruhige, offlinefähige **5-Minuten-Gedanken-Shift-PWA** nach dem Focus-Wheel-Prinzip (8 Segmente im Kreis).

Im Fokus stehen:
- **Mehrstufiger State-Flow & SVG-Geometrie** (ohne schwere Chart- oder DB-Libraries)
- **Mobiles App-Gefühl & Touch-UX** über die Skills `mobile-native` und `mobile-app-ui-design`
- **Sauberes Vite-PWA-Setup** über `vite-pwa-patterns`
- Optional: Entscheidungs-Skill [Jev](https://www.skills.sh/okooo5km/jev/jev) (`--with-jev`)

Struktur: pro Modell ein Ordner direkt unter diesem Verzeichnis (`tests/fokusrad-mini/<modellname>/`), analog zu `tests/habit-tracker/`.

## Aufgabe in Kürze

- **App:** „Fokusrad" mit Ausgangsgedanke, Zielgedanke (im Zentrum), 8 schrittweise befüllbaren SVG-Kreissegmenten, Stimmungs-Shift (Start/Ende 1–5), lokalem Archiv und Dark/Light-Mode.
- **Fester Stack:** Vite, React, TypeScript (`react-ts`), Tailwind CSS v4, `vite-plugin-pwa`, Persistenz über versioniertes `localStorage`.
- **Skills:**
  - `mobile-native` (`emilkowalski/skills`) – natives Smartphone-Gefühl per CSS & Meta-Tags (`dvh`, Safe-Areas, Touch/Hover-Trennung, kein Input-Auto-Zoom)
  - `mobile-app-ui-design` (`ceorkm/mobile-app-ui-design`) – Mobile-First-Aufbau, Thumb-Zone, 44px-Touch-Ziele, Empty-States
  - `vite-pwa-patterns` (`ai-enhanced-engineer/aiee-skills`) – Manifest, Service Worker, Workbox-Caching
  - Optional mit `--with-jev`: `jev` (`okooo5km/jev`)
- **Fertig**, wenn `npm run build` fehlerfrei durchläuft und `npm run preview` die funktionierende App zeigt.

## Dateien

| Datei | Zweck |
| --- | --- |
| [`fokusrad_prompt.md`](./fokusrad_prompt.md) | Benchmark-Prompt **MIT Jev**, darunter (`---`) die Bewertungsrubrik |
| [`fokusrad_prompt_ohne_jev.md`](./fokusrad_prompt_ohne_jev.md) | Benchmark-Prompt **OHNE Jev** (direkt kopierfertig), darunter (`---`) die Bewertungsrubrik |
| [`auto-install-skills.sh`](./auto-install-skills.sh) | Konfigurierbarer Skill-Installer mit `-d <ordner>`, `--with-jev`, `--dry-run`, `--check` und `--update` |
| [`install-skills.sh`](./install-skills.sh) | Einfacher Installer: installiert alle Basis-Skills + Jev in den aktuellen Ordner |
| [`run-opencode-sandbox.sh`](./run-opencode-sandbox.sh) | Startet OpenCode V2 (macOS, `sandbox-exec`) mit Schreibzugriff auf genau einen Modellordner |
| [`run-opencode-sandbox_alt.sh`](./run-opencode-sandbox_alt.sh) | Startet OpenCode V2 in Docker mit Schreibzugriff auf genau einen Modellordner |
| [`run-pi-sandbox.sh`](./run-pi-sandbox.sh) | Startet Pi (macOS, `sandbox-exec`) mit Schreibzugriff auf genau einen Modellordner |
| `<modellname>/` | Ein Lauf pro Modell: erzeugte App, `.agents/skills/` und `skills-lock.json` |

## Einen Test durchführen

1. **Modellordner anlegen & Skills installieren** (aus `tests/fokusrad-mini/`):
   ```bash
   # Ohne Jev:
   ./auto-install-skills.sh -d Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp

   # Oder mit Jev:
   ./auto-install-skills.sh -d Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp --with-jev

   # Optional Upstream-Stand prüfen:
   ./auto-install-skills.sh --check -d Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp
   ```

2. **OpenCode in der macOS-Sandbox starten:**
   ```bash
   ./run-opencode-sandbox.sh Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp
   # oder direkt mit --auto:
   ./run-opencode-sandbox.sh Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp --auto
   ```

3. **Prompt einfügen:**
   - Für Läufe **ohne Jev**: den Teil **oberhalb von `---`** aus [`fokusrad_prompt_ohne_jev.md`](./fokusrad_prompt_ohne_jev.md) kopieren.
   - Für Läufe **mit Jev**: den Teil **oberhalb von `---`** aus [`fokusrad_prompt.md`](./fokusrad_prompt.md) kopieren (vorher sicherstellen, dass `TYPESAFE_API_KEY` in der Shell gesetzt ist).
   - **Wichtig:** Die Bewertungsrubrik unterhalb von `---` wird dem Modell nicht gezeigt.

4. **Ergebnis sichern & prüfen:**
   - Das vom Modell erzeugte Ergebnis unverändert in Git sichern (siehe [`AGENTS.md`](../../AGENTS.md)).
   - Für den Browser-Test jeden Lauf auf einem eigenen Port/Origin starten oder vorher `localStorage`, Cache Storage und Service Worker für den Origin leeren.
