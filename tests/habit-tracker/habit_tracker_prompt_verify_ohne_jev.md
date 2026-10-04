# LLM-Bench Aufgabe: Habit- & Stimmungs-Tracker (PWA)

## Aufgabe

Baue eine kleine, schöne, offlinefähige PWA namens **„Rhythm"**: ein Habit- und Stimmungs-Tracker. Arbeite selbstständig im Projektordner, bis alles läuft. Am Ende muss `npm run build` ohne Fehler durchlaufen und `npm run preview` die App zeigen.

## Fester Stack (nicht diskutieren, nicht ersetzen)

- Vite + React + TypeScript (Template `react-ts`)
- `vite-plugin-pwa` (Manifest + Service Worker, Icons 192/512, installierbar). Nutze für die PWA-Konfiguration den installierten Skill `vite-pwa-patterns` und halte dich an seine Muster.
- Tailwind CSS v4
- IndexedDB über `idb` (kein Backend, alles lokal)
- Recharts für das Wochen-Chart

## Features

1. **Heute-Screen:** Liste der Habits, per Tap abhaken, mit sanfter Animation. Oben Datum und Fortschritt („3 von 5").
2. **Habits verwalten:** anlegen, umbenennen, löschen, Emoji und Farbe wählen.
3. **Streaks:** aktuelle und längste Serie pro Habit, sichtbar am Habit.
4. **Stimmung:** einmal pro Tag Stimmung von 1 bis 5 auswählen (mit Emojis), optional Kurznotiz.
5. **Woche-Screen:** Chart der letzten 7 Tage (erledigte Habits pro Tag und Stimmungsverlauf).
6. **Dark Mode:** folgt dem System, manuell umschaltbar, Auswahl wird gespeichert.
7. **Offline:** nach dem ersten Laden komplett offline nutzbar, Daten bleiben erhalten.
8. **Leerzustände** sinnvoll gestaltet (keine Habits, keine Daten).

## Design-Vorgaben

- Nutze den installierten Design-Skill (`minimalist-ui`) und halte dich an ihn.
- Gefühl: ruhig, modern, hochwertig. Referenzen im Kopf: Things, Streaks, Apple Health. Kein Bootstrap-Look, keine Standard-Blau-Buttons, keine grellen Verläufe.
- Mobile first (Ziel: 375 px Breite), auf Desktop zentrierte schmale Spalte.
- Große, klare Typografie mit deutlicher Hierarchie, viel Weißraum.
- Weiche Karten (große Radien, sehr dezente Schatten), Bottom-Navigation mit 3 Tabs (Heute, Woche, Einstellungen).
- Eine zurückhaltende Akzentfarbe plus pro Habit eine eigene Farbe. Kontrast nach WCAG AA.
- Touch-Ziele mindestens 44 px, sichtbare Fokuszustände, `prefers-reduced-motion` respektieren.
- Alle Texte auf Deutsch.

## Teststabile Selektoren (Pflicht)

Ein Smoke-Test bedient die App automatisch. Setze dafür diese `data-testid`-Attribute an die jeweiligen Elemente. Das Aussehen bleibt dir überlassen.

- `nav-today`, `nav-week`, `nav-settings`: die drei anklickbaren Tabs der Bottom-Navigation
- `progress`: Text mit dem Fortschritt im Format „X von Y"
- `habit-add`: Button, der das Anlegen eines Habits öffnet (auf dem Heute-Screen oder in den Einstellungen)
- `habit-name` und `habit-save`: Namensfeld und Speichern-Button im Anlegen-Formular
- `habit-item`: eine Zeile pro Habit auf dem Heute-Screen
- `habit-toggle`: Abhak-Button innerhalb jedes `habit-item`; `aria-pressed="true"`, wenn das Habit heute erledigt ist
- `habit-streak`: Text innerhalb jedes `habit-item` mit aktueller und längster Serie (zwei Zahlen)
- `mood-1` bis `mood-5`: die fünf Stimmungs-Buttons; der gewählte hat `aria-pressed="true"`
- `week-chart`: Container des Wochen-Charts
- `theme-toggle`: Button für den manuellen Wechsel Hell/Dunkel

## Ablauf

1. Projekt aufsetzen, Stack installieren, PWA konfigurieren.
2. Datenschicht (idb) und Streak-Logik.
3. Heute-Screen und Habit-Verwaltung.
4. Stimmung und Woche-Screen mit Chart.
5. Dark Mode, Leerzustände, Feinschliff.
6. `npm run build`, dann Preview starten und den Smoke-Test ausführen (siehe unten). Feature-Checkliste durchgehen, Reste beheben.

## Smoke-Test (Pflicht vor der Zusammenfassung)

Du hast keinen Browser. Ob die laufende App wirklich funktioniert, prüfst du ausschließlich mit dem mitgelieferten Smoke-Test. Er öffnet die App in einem headless Chrome bei 375 px, klickt sie durch und meldet pro Prüfung `PASS` oder `FAIL`.

```bash
npm run build
npm run preview -- --port 4173 --strictPort &
node ../tools/verify/verify.mjs http://localhost:4173
```

Regeln:

- Behebe die gemeldeten `FAIL`-Punkte, baue neu, starte die Preview bei Bedarf neu und führe den Test erneut aus. Die erste rote Prüfung zuerst: Folgefehler entstehen oft daraus.
- Ändere das Skript `verify.mjs` nicht und umgehe keine Prüfung.
- Bleibt dieselbe Prüfung nach drei Versuchen rot, lass sie offen und dokumentiere sie in der Zusammenfassung.
- Der Smoke-Test prüft nicht alles (Design, Kontrast, Animation, Emoji/Farbwahl). Was er nicht abdeckt, darfst du nicht als geprüft bezeichnen.

Beende mit einer kurzen Zusammenfassung: was funktioniert, was fehlt. Gib darin die Ergebniszeile des letzten Smoke-Test-Laufs („Ergebnis: X von Y Prüfungen bestanden.") wörtlich wieder und nenne die offenen Punkte. Behaupte nichts, was der Test oder deine eigene Ausgabe nicht belegt.