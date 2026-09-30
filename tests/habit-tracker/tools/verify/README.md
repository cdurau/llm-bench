# Smoke-Test für „Rhythm" (verify)

Kleines Playwright-Skript, das eine laufende Rhythm-App (`npm run preview`) in headless Chrome bei 375 px Breite bedient und pro Prüfung `PASS` oder `FAIL` ausgibt. Es ersetzt den fehlenden Browser-Zugriff des Agenten und liefert neutrale, beobachtbare Fehlermeldungen (was erwartet wurde, was gefunden wurde). Es verrät keine Lösungen.

## Einmalige Einrichtung

```bash
cd tests/habit-tracker/tools/verify
npm install
```

Braucht Google Chrome auf dem Rechner. Alternativ `CHROME_PATH=/pfad/zu/chrome` setzen.

## Aufruf (aus dem Run-Ordner)

```bash
npm run build
npm run preview -- --port 4173 --strictPort &
node ../tools/verify/verify.mjs http://localhost:4173
```

Bei Playwright-Timeouts enthält die Fehlermeldung Ziel-Element und Grund (z. B. "element is not visible").

Exit-Code 0 = alle Prüfungen grün, 1 = mindestens eine rot, 2 = Chrome nicht startbar. `--json` hängt das Ergebnis als JSON-Zeile an.

## Was geprüft wird (24 Prüfungen)

Laden ohne JS-Fehler, verarbeitetes Stylesheet, Bottom-Nav (sichtbar, unten, 44 px), Tab-Wechsel per Klick, kein horizontales Scrollen, Scrollbarkeit bei überlangem Inhalt, Fokus sichtbar, Habit anlegen, Fortschritt „X von Y", Abhaken pro Habit, Streak am Habit, Persistenz nach Reload, Stimmung 1 bis 5, Wochen-Chart, Dark Mode (manuell, gespeichert, folgt dem System), PWA-Manifest mit Icons 192/512, Service Worker, Offline-Reload mit Daten, Leerzustände.

Zusätzlich gibt es **Hinweise** ohne Wertung (z. B. SVG statt PNG-Icons, Zoom gesperrt, externe Ressourcen im HTML).

## Vertrag mit der App (`data-testid`)

| Attribut | Element |
| --- | --- |
| `nav-today`, `nav-week`, `nav-settings` | die drei Tabs der Bottom-Navigation |
| `progress` | Text mit „X von Y" |
| `habit-add` | Button, der das Anlegen öffnet (Heute oder Einstellungen) |
| `habit-name`, `habit-save` | Namensfeld und Speichern-Button |
| `habit-item` | eine Zeile pro Habit auf dem Heute-Screen |
| `habit-toggle` | Abhak-Button je Habit, `aria-pressed="true"` wenn erledigt |
| `habit-streak` | Text je Habit mit aktueller und längster Serie (zwei Zahlen) |
| `mood-1` … `mood-5` | Stimmungsbuttons, gewählter hat `aria-pressed="true"` |
| `week-chart` | Container des Wochen-Charts (enthält das SVG) |
| `theme-toggle` | Button für manuellen Dark/Light-Wechsel |

## Grenzen

- Die Stimmungs-, Dark-Mode- und Habit-Prüfungen suchen die Elemente auf allen drei Screens. Ist die Navigation kaputt, schlagen viele Folgeprüfungen mit an. Bei der Auswertung die erste rote Prüfung zuerst lesen.
- Fokus- und Scroll-Prüfung sind Heuristiken. Design, Kontrast (WCAG), Animation und Emoji/Farbwahl beim Anlegen bleiben manuelle Prüfung.
- Kalibrierung: gegen eine eigens gebaute Referenz-App 24 von 24, gegen eine absichtlich kaputte Variante (rohes CSS, tote Tabs, globales Abhaken, kein Service Worker) 15 von 24.
- Das Skript darf vom Modell gelesen, aber nicht geändert werden. Nach dem Lauf `git status tools/` prüfen.
