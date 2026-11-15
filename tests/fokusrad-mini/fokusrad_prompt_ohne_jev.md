# LLM-Bench Aufgabe: Fokusrad Mini (PWA)

## Aufgabe

Baue eine kleine, ruhige, offlinefähige Progressive Web App namens **„Fokusrad"**: ein 5-Minuten-Gedanken-Shift-Tool nach dem Focus-Wheel-Prinzip. Arbeite selbstständig im Projektordner, bis alles läuft. Am Ende muss `npm run build` ohne Fehler durchlaufen und `npm run preview` die App zeigen.

## Fester Stack (nicht diskutieren, nicht ersetzen)

- Vite + React + TypeScript (Template `react-ts`)
- Tailwind CSS v4 (achte auf die korrekte Einbindung über `@import "tailwindcss";`)
- `vite-plugin-pwa` (Manifest + Service Worker, `registerType: 'autoUpdate'`, echte SVG/PNG-Icons > 0 Bytes in `public/`, installierbar). Nutze für die PWA-Konfiguration den installierten Skill `vite-pwa-patterns` und halte dich an seine Muster.
- Persistenz über versioniertes `localStorage` (kein Backend, keine externe DB-Library nötig; ungültige gespeicherte Daten dürfen die App nicht zum Absturz bringen)

## Features

1. **Neues Fokusrad starten:**
   - Eingabe **Ausgangsgedanke / aktuelles Gefühl** (was gerade stört oder drückt).
   - Eingabe **Zielgedanke / Wunschgefühl** (wie ich mich stattdessen fühlen möchte – steht später im Zentrum des Rads).
   - Auswahl der **Start-Stimmung** auf einer Skala von 1 bis 5.

2. **Aktive Fokusrad-Session (8 Segmente):**
   - Ein visuelles **SVG-Fokusrad** mit **8 Kreissegmenten** rund um die Mitte; in der Mitte steht der Zielgedanke.
   - Schrittweise Eingabe von **8 überbrückenden, entlastenden Sätzen** (von Segment 1 bis 8).
   - Mit jedem eingetragenen Satz füllt/färbt sich das zugehörige Segment im SVG-Rad sanft ein und die Fortschrittsanzeige („3 von 8 Gedanken") aktualisiert sich.
   - Bereits eingetragene Sätze der laufenden Session sind unterhalb des Rads sichtbar und können bei Bedarf noch bearbeitet werden.
   - Eine laufende, noch nicht abgeschlossene Session wird automatisch in `localStorage` zwischengespeichert und bleibt nach einem Seiten-Reload erhalten.

3. **Abschluss & Stimmungs-Shift:**
   - Sobald alle 8 Segmente gefüllt sind, kann das Fokusrad abgeschlossen werden.
   - Beim Abschluss wird die **End-Stimmung (1 bis 5)** abgefragt und die Veränderung sichtbar hervorgehoben (z. B. „Stimmung: 2 → 4").

4. **Archiv / Verlauf:**
   - Übersicht aller abgeschlossenen Fokusräder (Datum, Ausgangsgedanke, Zielgedanke, Start- → End-Stimmung).
   - Antippen eines Eintrags öffnet die Detailansicht mit dem vollen Rad und allen 8 Sätzen.
   - Einträge können gelöscht werden (mit kurzer Bestätigung).

5. **Dark Mode:**
   - Sichtbarer Theme-Toggle (Light / Dark / System), der die **gesamte** Oberfläche umstellt und in `localStorage` gespeichert wird.

6. **Offline & Leerzustände:**
   - Nach dem ersten Laden komplett offline nutzbar, Daten bleiben erhalten.
   - Einladender Leerzustand beim ersten Start (noch keine gespeicherten Fokusräder) mit direktem, sofort klickbarem Start-Button.

## Design- & Architektur-Vorgaben

- Lade und befolge die beiden installierten UI-Skills:
  - **`mobile-app-ui-design`** für Screen-Aufbau, visuelle Hierarchie, Thumb-Zone im unteren Drittel, 44px-Touch-Ziele und sinnvolle Leerzustände.
  - **`mobile-native`** für echtes Smartphone-App-Gefühl (`dvh` statt `100vh`, Safe-Area-Insets, `>= 16px` Schriftgröße in Inputs gegen iOS-Auto-Zoom, `@media (hover: hover)` gegen klebende Touch-Hover-States, `user-select: none` auf interaktiven Buttons).
- **Gefühl:** ruhig, warm, fokussiert („Morgenfluss"-Ästhetik: sanfte Teal-/Salbei- und warme Sand-/Schiefer-Töne, keine grellen Standard-Blau-Buttons). Kontrast nach WCAG AA in Light **und** Dark Mode.
- **Mobile first** (Ziel: 375 px Breite sauber einhändig bedienbar, auf Desktop zentrierte schmale Spalte).
- **Schlanke Architektur:** Halte die Projektstruktur übersichtlich und flach (z. B. `src/types.ts`, `src/storage.ts`, `src/components/FocusWheelSvg.tsx`, `src/components/...`, `src/App.tsx`), keine unnötig tief verschachtelten Ordner.
- Alle sichtbaren Texte auf **Deutsch**.

## Ablauf

1. Projekt aufsetzen, Stack installieren, Skills (`vite-pwa-patterns`, `mobile-native`, `mobile-app-ui-design`) lesen, PWA + echte Icons konfigurieren.
2. Datenmodell (`types.ts`) und versionierte `localStorage`-Schicht (`storage.ts` inkl. Entwurfs-Persistenz für laufende Session).
3. `FocusWheelSvg.tsx` (8 Segmente + Zielgedanke im Zentrum) und aktiver Session-Flow (Start → 8 Sätze → Abschluss mit Stimmungs-Shift).
4. Archiv-Liste, Detailansicht, Löschen und Leerzustand.
5. Dark Mode, `mobile-native`-Polish (Safe Areas, `dvh`, Input-Font-Size, Hover-Media-Queries) und Tastatur-/A11y-Feinschliff.
6. `npm run build` und `npm run preview` ausführen, alle Features prüfen (insbesondere ob Stylesheet greift, Icons > 0 Byte sind und der Start-Button im Leerzustand funktioniert) und Reste beheben.

Beende mit einer kurzen Zusammenfassung: was funktioniert und was ggf. fehlt.

---

## Bewertungsrubrik (für die Auswertung, nicht ins Modell geben)

Score je Kriterium 1 bis 5:

1. **Features:** Anzahl der 6 Feature-Blöcke (Start, 8-Segmente-Session + Reload-Schutz, Abschluss/Shift, Archiv/Detail/Löschen, Dark Mode, Offline/Empty-State), die wirklich funktionieren
2. **Build & PWA:** `npm run build` läuft, Manifest + Service Worker aktiv, Icons > 0 Byte, offline nutzbar
3. **Codequalität & SVG:** Saubere Typisierung, robuste `localStorage`-Persistenz, funktionierende 8-Segment-SVG-Geometrie
4. **Design & Mobile-Native:** „Morgenfluss"-Ästhetik, Hierarchie, Dark Mode, Umsetzung von `mobile-native` (`dvh`, `>=16px` Inputs, `@media (hover: hover)`) und `mobile-app-ui-design` (Thumb-Zone, 44px Targets)
5. **Agent-Verhalten:** Tool-Nutzung, Pfad-Sicherheit, Fehlerkorrektur, Selbstständigkeit
6. **Zeit / Tokens:** Dauer und Durchsatz (tok/s) für den Vergleich
7. **First-Pass Technical Quality:** Anteil der Kernfunktionen, die nach dem eigentlichen Build ohne Nutzerhinweise oder zusätzliche Reparatursessions tatsächlich funktionieren
8. **Repair Effort:** 5 = kaum oder keine zusätzliche Reparaturarbeit; 1 = viele zusätzliche Agenten-Runden oder Nutzer-Bugreports nötig
