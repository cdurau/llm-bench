# LLM-Bench Aufgabe: Habit- & Stimmungs-Tracker (PWA)

## Aufgabe

Baue eine kleine, schöne, offlinefähige PWA namens **„Rhythm"**: ein Habit- und Stimmungs-Tracker. Arbeite selbstständig im Projektordner, bis alles läuft. Am Ende muss `npm run build` ohne Fehler durchlaufen und `npm run preview` die App zeigen.

## Fester Stack (nicht diskutieren, nicht ersetzen)

- Vite + React + TypeScript (Template `react-ts`)
- `vite-plugin-pwa` (Manifest + Service Worker, Icons 192/512, installierbar)
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

## Arbeitsweise mit Jev

Du hast den **Jev-Skill** zur Verfügung (im Projekt installiert). Lade ihn und halte dich an seine Anleitung, wie Jev aufgerufen wird. Jev ist ein schnelles Entscheidungsmodell für Ja/Nein-, Auswahl- und Score-Fragen. Nutze es, statt lange selbst abzuwägen, wenn eine Entscheidung eine klar aufzählbare Antwort hat. Nicht für Code oder Freitext.

Regeln:

- Gib Jev **Rohmaterial** (Code, Dateiliste, CSS-Werte, Feature-Liste), keine Schlussfolgerung von dir. Sag also nicht „das ist bestimmt okay", sondern schick die echten Daten.
- Frag konkret, z. B.:
  - noul: „Erfüllt diese Komponente alle Anforderungen aus Feature 1?"
  - choice: „Welcher der drei Layout-Ansätze passt am besten zum Design-Skill?"
  - score: „Wie gut ist die Typografie-Hierarchie dieser CSS-Klassen?"
- Sinnvolle Einsatzpunkte: Feature-Checkliste nach jedem Meilenstein, Kontrast-Check der Farbpaare, Prüfen ob ein Screen dem Design-Skill folgt, Entscheidung zwischen zwei Umsetzungsvarianten.
- Bei niedriger Confidence (unter 0.5) entscheide selbst und geh weiter. Bei einem klaren Nein: beheben.
- Jev entscheidet nur. Der Code kommt von dir.

## Ablauf

1. Projekt aufsetzen, Stack installieren, PWA konfigurieren.
2. Datenschicht (idb) und Streak-Logik.
3. Heute-Screen und Habit-Verwaltung.
4. Stimmung und Woche-Screen mit Chart.
5. Dark Mode, Leerzustände, Feinschliff.
6. `npm run build` und `npm run preview`, Feature-Checkliste mit Jev durchgehen, Reste beheben.

Beende mit einer kurzen Zusammenfassung: was funktioniert, was fehlt, wie oft du Jev genutzt hast.

---

## Bewertungsrubrik (für die Auswertung, nicht ins Modell geben)

Score je Kriterium 1 bis 5:

1. **Features:** Anzahl der 8 Features, die wirklich funktionieren
2. **Build & PWA:** Build läuft, installierbar, offline nutzbar
3. **Codequalität:** Struktur, Typisierung, Lesbarkeit
4. **Design:** Hierarchie, Weißraum, Konsistenz, Dark Mode
5. **Mobile & A11y:** Touch-Ziele, Kontrast, Fokus
6. **Agent-Verhalten:** Tool-Nutzung, Fehlerkorrektur, Selbstständigkeit
7. **Jev-Nutzung:** sinnvoll eingesetzt oder Alibi-Aufrufe (nur im Lauf mit Jev)
8. **Zeit / Tokens:** Dauer und Durchsatz (tok/s) für den Vergleich

Empfehlung: pro Modell zwei Läufe (ohne Jev, mit Jev), sonst identisch.
