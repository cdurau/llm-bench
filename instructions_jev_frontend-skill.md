Erstelle in diesem leeren Verzeichnis eine kleine, produktionsnahe PWA namens **PulseBoard**.

### Ziel

Eine minimalistische persönliche Tagesübersicht, in der Nutzer kleine Aktivitäten oder Gewohnheiten abhaken und ihren Tagesfortschritt sehen können.

### Technische Anforderungen

- React
- TypeScript
- Vite
- PWA-fähig
- Keine Backend-API
- Keine externen Webdienste
- Daten lokal im Browser speichern
- Die Anwendung muss offline funktionieren
- Responsive für Desktop und Smartphone

### Funktionen

#### 1. Aktivitäten verwalten

- Aktivität hinzufügen
- Aktivität bearbeiten
- Aktivität löschen
- Jede Aktivität hat:
    - Name
    - optionale Beschreibung
    - Kategorie
    - optionales Tagesziel als Zahl

#### 2. Tagesstatus

- Aktivitäten für den aktuellen Tag abhaken
- Abgehakte Einträge müssen nach einem Reload erhalten bleiben
- Der Status verschiedener Kalendertage darf sich nicht gegenseitig überschreiben

#### 3. Dashboard

Zeige:

- Anzahl erledigter Aktivitäten
- Anzahl offener Aktivitäten
- Fortschritt in Prozent
- einfache Übersicht nach Kategorie

#### 4. Tagesnavigation

- Heute
- vorheriger Tag
- nächster Tag
- Ein zukünftiger Tag darf angezeigt werden, aber Aktivitäten dort dürfen noch nicht als erledigt markiert werden

#### 5. Persistenz

- Verwende localStorage oder IndexedDB
- Die Datenstruktur soll versioniert sein
- Ungültige oder veraltete gespeicherte Daten dürfen die App nicht zum Absturz bringen

#### 6. PWA

- Manifest
- installierbar
- sinnvoller App-Name und Icons bzw. generierbare Platzhalter
- Service Worker
- App-Shell soll offline funktionieren

#### 7. UX

- Benutze den skill frontend-design um das design zu planen und umzusetzen
- sauberes, modernes und ruhiges Design
- Dark Mode berücksichtigen
- Tastaturbedienung nicht vergessen
- sinnvolle Empty States
- sinnvolle Fehlermeldungen
- keine unnötigen Animationen

#### 8. Qualität

- automatisierte Tests schreiben
- insbesondere testen:
    - Erstellen einer Aktivität
    - Bearbeiten
    - Löschen
    - Tagesstatus
    - Datumswechsel
    - Persistenz
    - beschädigte gespeicherte Daten
- TypeScript ohne offensichtliche Typfehler
- Linting
- Production Build

### Arbeitsweise

- Arbeite selbstständig.
- Benutze den Jev Skill wenn du eine entscheidung triffst nach diesem Schema: jev pick "FRAGE" "OPTION_A" "OPTION_B" -s "KONTEXT"
- Stelle keine Rückfragen.
- Entscheide selbst über eine sinnvolle Projektstruktur.
- Führe Tests, Lint und Production Build selbst aus.
- Wenn etwas fehlschlägt, analysiere die Ursache und korrigiere sie.
- Erstelle eine AGENTS.md mit Anweisungen für das Projekt
- Halte den Projektstand und Erinnerungen, sowie die Planung nach jedem sinnvollen Meilenstein in entsprechenden Markdown Dateien im Root-Verzeichnis fest und verlinke die Dateien in der AGENTS.md
- Verifiziere am Ende den tatsächlichen Zustand der Anwendung.
- Beende die Aufgabe erst, wenn Tests und Build erfolgreich sind.