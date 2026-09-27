# STATUS.md — PulseBoard

Meilenstein-Log, aktueller Stand, Verifikationsergebnisse und Erinnerungen.
Nächste Schritte stehen am Ende.

## Meilensteine

| M | Meilenstein | Status | Datum |
|---|---|---|---|
| M0 | Plan: Design-Konzept („Ruhiges Instrument“), Architektur, Jev-Entscheidungslog → [PLAN.md](./PLAN.md) | ✅ | 2026-09-27 |
| M1 | Scaffold: Configs (Vite 7, TS strict, ESLint 9, Vitest 3), Dependencies, Icons-Skript, PWA-Basis | ✅ | 2026-09-27 |
| M2 | Domäne: Types, Dates, Clock, Storage (versioniert, saniert), Store/Reducer + Selectoren; Unit-Tests | ✅ | 2026-09-27 |
| M3 | UI: alle Komponenten, Design-Tokens (light/dark), a11y, Empty States, Dialog, Toasts | ✅ | 2026-09-27 |
| M4 | Integrationstests (CRUD, Tagesstatus, Datumswechsel, Persistenz, Corruption, Keyboard) — 47 Tests | ✅ | 2026-09-27 |
| M5 | Gates (Lint, Typecheck, Build) + echte Browser-Verifikation inkl. Offline-Test, Doku final | ✅ | 2026-09-27 |

## Aktueller Stand (2026-09-27)

**Alles grün, Aufgabe abgeschlossen.**

| Gate | Ergebnis |
|---|---|
| `npm test` (Vitest + RTL) | ✅ **47/47 Tests** (storage, dates, store, App-Integration) |
| `npm run lint` (ESLint) | ✅ 0 Fehler, 0 Warnungen |
| `npm run typecheck` (tsc -b, strict) | ✅ sauber |
| `npm run build` (Vite + PWA) | ✅ `dist/` inkl. `sw.js` (Precache, 9 eindeutige Assets), `manifest.webmanifest`, Icons |

### Echte Browser-Verifikation (headless Chrome via CDP, `scripts/verify-pwa.mjs`)

Stufe A (Server online, `http://localhost:4173`):
- ✅ Service Worker aktiv, Precache vollständig (9/9 Assets aus dem sw.js-Manifest)
- ✅ UI-Interaktion: 2 Aktivitäten über den echten Dialog angelegt (eine mit Tagesziel 3)
- ✅ Abhaken: aria-pressed korrekt, Zähler-Chip `1/3`, Fortschritt `50 %`
- ✅ localStorage: versioniertes Dokument (`version: 1`), Tagesstatus pro Datum
- ✅ Reload online: Status + Daten erhalten
- ✅ Screenshots: `desktop-light.png`, `desktop-dark.png`, `mobile-light.png`

Stufe B (Preview-Server **gestoppt**, Reload im selben Profil):
- ✅ App rendert **vollständig offline** aus dem Precache — App-Shell,
  Aktivitäten, Tagesstatus (`50 %`) und Daten intakt
- ✅ Screenshot: `offline-desktop.png`

Screenshots liegen in `pulseboard-verify/` (Temp-Verzeichnis des Verifikationslaufs).

## Bemerkungen / Abweichungen

- **Jev-Entscheidungen** (Details + Confidence in PLAN.md §6): localStorage statt
  IndexedDB (jev conf 0.34 → schwaches Signal, nach Risiko entschieden: kleiner
  Datensatz, synchrone API, Requirements erlauben beides), vite-plugin-pwa,
  useReducer+Context, CSS-Tokens, Vitest+RTL, Tag im URL-Hash, Kategorien als Freitext.
- **Workbox-Manifest** enthält 4 harmlose Duplikate (Icons/Manifest werden vom
  Plugin doppelt gelistet, gleiche URL + Revision → gleicher Cache-Key). Bauebene des
  Plugins, funktional irrelevant; nicht „repariert“, um den Generator-Output nicht
  manuell zu patchen.
- **Desktop-Browser-Tools** der Session waren nicht verbunden → Verifikation statt
  mit lokal installiertem Google Chrome (headless, CDP) durchgeführt.
- Der Offline-Test simuliert „offline“ realistisch über **gestoppten Server** (diese
  Chrome-Build-CDP kennt kein `Network.emulateOffline`). `navigator.onLine` bleibt
  dabei `true`; das entscheidende Kriterium ist: App + Daten laufen ohne Server.
- Bei `prefers-reduced-motion` sind alle Transitions deaktiviert; Dark Mode folgt
  der Systemeinstellung (bewusst ohne manuellen Schalter).

## Erinnerungen / Nächste Schritte (optional, kein Rest)

- Echter Offline-Check mit `Network.emulateOffline` auf CI-Chrome möglich
  (dort verfügbar); aktuell genügt der Server-stop-Ansatz.
- Playwright-E2E als zusätzliche Ebene nur sinnvoll, wenn die PWA in CI geprüft
  werden soll (aktuell nicht nötig).
- Installability (Ladebildschirm/OS-Integration) wurde nicht geprüft — Manifest
  erfüllt die Chrome-Kriterien (name, start_url, display, 192+512 Icons, SW).
- Eventuell: „Tagesziel“-Bearbeitung > 999 wird im Dialog validiert (max 999).
