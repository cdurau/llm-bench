# AGENTS.md — PulseBoard

PulseBoard ist eine kleine, produktionsnahe **PWA**: persönliche Tagesübersicht, in der
man Aktivitäten/Gewohnheiten anlegt, sie pro Kalendertag abhaken (mit optionalem
Tagesziel als Zähler) und Fortschritt plus Kategorie-Übersicht sieht. Kein Backend,
keine externen Webdienste, Daten lokal im Browser (localStorage, versioniert), offline
nutzbar und installierbar. UI-Sprache: Deutsch.

## Orientierungsdateien

- [PLAN.md](./PLAN.md) — Design-Konzept („Ruhiges Instrument“), Architektur,
  Datenmodell, Testplan und Jev-Entscheidungslog.
- [STATUS.md](./STATUS.md) — Meilenstein-Log, aktueller Projektstand,
  Verifikationsergebnisse, Erinnerungen/Nächste Schritte.

Bevor Änderungen am Design oder an der Architektur geplant werden: PLAN.md lesen.
Nach jedem Meilenstein: STATUS.md aktualisieren.

## Befehle

| Befehl | Wirkung |
|---|---|
| `npm run dev` | Dev-Server (Vite, Port 5173) |
| `npm run build` | Typecheck (`tsc -b`) + Production Build inkl. PWA-Generierung nach `dist/` |
| `npm run preview` | Build lokal servieren (Port 4173) — Basis für die PWA-Verifikation |
| `npm test` | Vitest + React Testing Library (jsdom), einmalig |
| `npm run lint` | ESLint (Flat Config, typescript-eslint, react-hooks) |
| `npm run typecheck` | `tsc -b` |
| `npm run icons` | PWA-Icons neu erzeugen (`scripts/generate-icons.mjs`, reines zlib — keine externen Dienste) |
| `node scripts/verify-pwa.mjs <outdir>` | PWA-Verifikation mit headless Chrome via CDP (Stufe A: UI-Interaktion, Persistenz, Screenshots; **Server stoppen**; `--offline`: Stufe B, App ohne Server) |

## Architektur in Kürze

- **Stack:** React 19 + TypeScript (strict) + Vite, `vite-plugin-pwa` (generateSW,
  `registerType: 'prompt'`), Vitest + RTL, handgeschriebenes CSS mit Design-Tokens.
- **Zustand:** `useReducer` + Context (`src/state/`). Selectoren und Reducer sind
  pure, in `src/state/store.ts`.
- **Datenmodell:** `{ version, activities[], progress: { "YYYY-MM-DD": { activityId: count } } }`
  in localStorage unter `pulseboard:data`. Details: PLAN.md §3.
- **Tag:** Quelle der Wahrheit ist die **URL-Hash** (`#/2026-09-27`; leer = heute).
  `src/hooks/useSelectedDay.ts`.
- **Uhr:** Alle Datumsfunktionen fragen `src/lib/clock.ts` (`now()`) ab; Tests
  setzen per `setClock()` ein festes Datum (keine Fake-Timer, die user-event brechen).
- **PWA-Registrierung:** `src/components/PwaUpdater.tsx` konsumiert
  `virtual:pwa-register` (Update-Prompt „Neu laden“). In Tests wird das virtuelle
  Modul per Alias in `vite.config.ts` auf `src/test/pwa-stub.ts` gemappt.

## Feste Regeln (nicht verhandeln, ohne PLAN.md anzupassen)

1. **Kein Backend, keine externen Webdienste** — keine Webfonts, keine CDNs,
   keine APIs. Icons werden lokal generiert.
2. **Versionierte Persistenz:** `SCHEMA_VERSION` in `src/lib/storage.ts`. Bei
   Strukturwechsel: Version erhöhen, Migration in `parseStored`/`migrate` ergänzen
   und Tests in `src/lib/storage.test.ts` erweitern. Ungültige/veraltete Daten
   dürfen die App nie crashen (sanitize → Banner „beschädigte Daten“).
3. **Zukünftige Tage:** dürfen angezeigt, aber nicht abgehakt werden — UI
   (disabled) **und** Reducer (`isFuture`-Check in `progress/toggle`/`decrement`).
   Beide Ebenen testen.
4. **Tagesstatus ist pro Datum isoliert** (`progress[day]`) — kein Überschreiben
   zwischen Tagen.
5. **Zähl-Semantik:** `target` ≥ 1; Klick zählt hoch, volles Ziel = erledigt,
   weiterer Klick = Reset auf 0. `decrement` geht einen Schritt zurück (Boden 0).
6. **Design:** Tokens in `src/styles.css` (`:root` light + `prefers-color-scheme:
   dark`), eine Spalte, keine Karten-Kits, Pulslinie als einziges mutiges Element.
   Änderungen am Look: PLAN.md §2 aktualisieren.
7. **Tests:** CRUD, Tagesstatus, Datumswechsel, Persistenz, beschädigte Daten sind
   abgedeckt (47 Tests). Neue Features → neue Tests daneben (`*.test.ts(x)`).

## Qualitäts-Gates (vor Abschluss jeder größeren Änderung)

`npm run lint` · `npm run typecheck` · `npm test` · `npm run build` — alle grün,
dann `STATUS.md` um eine Zeile aktualisieren.
