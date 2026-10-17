# LLM-Bench Aufgabe: Habit- & Stimmungs-Tracker (PWA)

## Aufgabe

Baue eine kleine, schöne, offlinefähige PWA namens **„Rhythm“**: einen Habit- und Stimmungs-Tracker. Arbeite selbstständig im Projektordner, bis alles läuft. Am Ende muss `npm run build` ohne Fehler durchlaufen und `npm run preview` die App zeigen.

## Fester Stack (nicht diskutieren, nicht ersetzen)

- Vite + React + TypeScript (Template `react-ts`)
- `vite-plugin-pwa` (Manifest + Service Worker, Icons 192/512, installierbar). Nutze für die PWA-Konfiguration den installierten Skill `vite-pwa-patterns` und halte dich an seine Muster.
- Tailwind CSS v4
- IndexedDB über `idb` (kein Backend, alles lokal)
- Recharts für das Wochen-Chart

## Features

1. **Heute-Screen:** Liste der Habits, per Tap abhaken, mit sanfter Animation. Oben Datum und Fortschritt („3 von 5“).
2. **Habits verwalten:** anlegen, umbenennen, bearbeiten, löschen, Emoji und Farbe wählen.
3. **Streaks:** aktuelle und längste Serie pro Habit, sichtbar am Habit.
4. **Stimmung:** einmal pro Tag Stimmung von 1 bis 5 auswählen (mit Emojis), optional Kurznotiz.
5. **Woche-Screen:** Chart der letzten 7 Tage (erledigte Habits pro Tag und Stimmungsverlauf).
6. **Dark Mode:** folgt dem System, manuell umschaltbar, Auswahl wird gespeichert. Heller und dunkler Modus müssen auf allen Screens konsistent funktionieren.
7. **Offline:** nach dem ersten Laden komplett offline nutzbar, Daten bleiben erhalten.
8. **Leerzustände:** sinnvoll gestaltet (keine Habits, keine Daten).

## Design-Vorgaben

- Nutze den installierten Design-Skill (`minimalist-ui`) und halte dich an ihn.
- Gefühl: ruhig, modern, hochwertig. Referenzen im Kopf: Things, Streaks, Apple Health. Kein Bootstrap-Look, keine Standard-Blau-Buttons, keine grellen Verläufe.
- Mobile first (Ziel: 375 px Breite), auf Desktop zentrierte schmale Spalte.
- Große, klare Typografie mit deutlicher Hierarchie, viel Weißraum.
- Weiche Karten (große Radien, sehr dezente Schatten), Bottom-Navigation mit 3 Tabs (Heute, Woche, Einstellungen).
- Eine zurückhaltende Akzentfarbe plus pro Habit eine eigene Farbe. Kontrast nach WCAG AA.
- Touch-Ziele mindestens 44 px, sichtbare Fokuszustände, `prefers-reduced-motion` respektieren.
- Alle Texte auf Deutsch.

## Arbeitsweise

Arbeite eigenständig und zielorientiert im Projektordner.

- Lade die angegebenen Skills und berücksichtige deren Vorgaben.
- Setze die Anforderungen schrittweise um und überprüfe nach jedem Meilenstein die Ergebnisse.
- Triff notwendige technische und gestalterische Entscheidungen selbstständig.
- Prüfe Funktionen anhand des tatsächlichen Codes und, soweit Werkzeuge verfügbar sind, durch Ausführung.
- Behebe erkannte Fehler direkt.
- Vermeide unnötige Rückfragen und Diskussionen.
- Implementiere keine bloßen Platzhalter für geforderte Funktionen.
- Verwende den vorgegebenen Stack.

## Ablauf

1. Projekt aufsetzen, Stack installieren, PWA konfigurieren.
2. Datenschicht (`idb`) und Streak-Logik.
3. Heute-Screen und Habit-Verwaltung.
4. Stimmung und Woche-Screen mit Chart.
5. Dark Mode, Leerzustände, Feinschliff.
6. `npm run build` ausführen, `npm run preview` starten, alle Features eigenständig überprüfen und verbleibende Fehler beheben.

### Abschließende Funktionsprüfung

Kontrolliere insbesondere:

- Habits lassen sich erstellen, abhaken, bearbeiten und löschen.
- Emoji und Farbe können geändert werden.
- Aktuelle und längste Streaks werden korrekt berechnet.
- Stimmung und Notiz werden dauerhaft gespeichert.
- Das Wochen-Chart zeigt die richtigen Daten.
- Alle drei Navigationsbereiche funktionieren.
- Dark Mode, Light Mode und Systemmodus funktionieren konsistent.
- Die Anwendung ist auf 375 px Breite nutzbar.
- Daten bleiben nach einem Neuladen erhalten.
- Die PWA ist nach dem ersten Laden offline verwendbar.
- Der Build läuft ohne Fehler.

Führe tatsächliche Tests durch, sofern entsprechende Werkzeuge verfügbar sind. Kennzeichne nicht überprüfte Funktionen als solche.

Beende mit einer kurzen Zusammenfassung: Was funktioniert, was fehlt und welche Prüfungen erfolgreich waren.

---

## Bewertungsrubrik (für die Auswertung, nicht ins Modell geben)

Score je Kriterium 1 bis 5, außer bei ausdrücklich angegebenen Messwerten.

1. **Features:** Anzahl der 8 Features, die wirklich funktionieren.
2. **Build & PWA:** Build läuft, installierbar, offline nutzbar.
3. **Codequalität:** Struktur, Typisierung, Lesbarkeit.
4. **Design:** Hierarchie, Weißraum, Konsistenz, Dark Mode.
5. **Mobile & A11y:** Touch-Ziele, Kontrast, Fokus.
6. **Agent-Verhalten:** Tool-Nutzung, Fehlerkorrektur, Selbstständigkeit.
7. **Zeit / Tokens:** Dauer, generierte Tokens und Durchsatz (tok/s) für den Vergleich.
8. **First-Pass Technical Quality:** Anteil der Kernfunktionen, die nach dem eigentlichen Build ohne Nutzerhinweise oder zusätzliche Reparatursessions tatsächlich funktionieren.
9. **Repair Effort:** 5 = kaum oder keine zusätzliche Reparaturarbeit; 1 = viele zusätzliche Agenten-Runden, Bugfix-Sessions oder Nutzer-Bugreports bis zu einem brauchbaren Endzustand.

### Hinweise zur Bewertung

Designqualität, First-Pass Technical Quality und Repair Effort werden getrennt ausgewiesen.

Ein visuell stärkerer Endzustand mit hoher Nacharbeit ist ein anderes Ergebnis als eine optisch einfachere, aber technisch nahezu sofort funktionierende App.

**Für faire Modellvergleiche:**

- Pro Modell möglichst zwei unabhängige Läufe mit identischem Prompt.
- Identischer Projekt-Ausgangszustand.
- Identischer Stack und dieselben installierten Skills.
- Gleiche Agenten-Konfiguration und Tool-Berechtigungen, soweit möglich.
- Keine manuellen Korrekturen während des eigentlichen Benchmark-Laufs.
- Nachträgliche Reparaturen separat dokumentieren.
- Laufzeit, Tokenverbrauch und Durchsatz getrennt erfassen.
- First-Pass-Ergebnis und finalen Zustand separat bewerten.

### Empfehlung

Verwende diesen Prompt als feste Baseline für zukünftige Rhythm-Benchmarks. Damit lassen sich die technische Zuverlässigkeit, Designqualität, Agenten-Fähigkeiten und Effizienz verschiedener Coding-Modelle unter möglichst gleichen Bedingungen vergleichen.