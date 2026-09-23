# RESULT — Qwen3-Coder-Next / PulseBoard PWA

**Datum:** 2026-09-23  
**Modell:** Qwen3-Coder-Next  
**Runtime:** LM Studio, MLX 4-bit  
**Agent:** OpenCode v2  
**Kontext:** ca. 64K  
**Jev:** als Skill verfügbar, aber nicht explizit zur Nutzung angewiesen  
**Benchmark-Prompt:** `instructions.md`

## Kurzfazit

Der Lauf ist **teilweise erfolgreich**, erreicht aber den im Prompt geforderten produktionsnahen Endzustand nicht.

Qwen3-Coder-Next hat eine vergleichsweise umfangreiche React-/TypeScript-Struktur aufgebaut, lokale Persistenz implementiert, Tests angelegt und während des Agentenlaufs mehrfach TypeScript-/Lint-Probleme selbstständig analysiert und korrigiert. Besonders positiv war die Fähigkeit, nach einer unterbrochenen OpenCode-/LM-Studio-Session den vorhandenen Projektstand erneut einzulesen und weiterzuarbeiten.

Die abschließende End-to-End-Verifikation war jedoch nicht ausreichend. Der im Browser geprüfte finale Stand ist praktisch ungestylt, die PWA meldet einen ungültigen bzw. fehlenden Manifest-Icon-Resource, und mehrere funktionale Anforderungen sind nur auf State-/Context-Ebene vorhanden, aber nicht vollständig über die UI erreichbar.

**Ergebnis:** guter agentischer Coding- und Recovery-Lauf, aber kein erfolgreich abgeschlossener Produktions-/PWA-Lauf.

## Anforderungsabgleich

| Bereich | Status | Beobachtung |
|---|---|---|
| React / TypeScript / Vite | PASS | Projektstruktur und Build-Setup sind vorhanden. |
| Lokale Persistenz | PASS | Versionierte localStorage-Struktur mit Validierung und Fallback bei beschädigten Daten. |
| Aktivität hinzufügen | PASS / weitgehend | Add-Form und Context-Funktion sind vorhanden. |
| Aktivität bearbeiten | FAIL | `EditActivityForm` existiert, wird aber nicht in den sichtbaren Flow eingebunden. `ActivityItem` hat einen lokalen Edit-Modus, aber keinen funktionierenden Save-Pfad. |
| Aktivität löschen | FAIL | `deleteActivity` existiert im Context, aber im finalen UI-Flow ist keine Löschaktion angebunden. |
| Tagesstatus pro Datum | PASS / weitgehend | Status wird mit `activityId + date` gespeichert; Tageszustände sind getrennt. |
| Zukunftstage nicht abhaken | PASS | `ActivityItem` verhindert Toggle/Value-Änderungen für zukünftige Tage. |
| Vorheriger / nächster Tag | FAIL / teilweise | Vorwärtsnavigation ist vorhanden. Die Logik verhindert jedoch vom heutigen Tag aus die Navigation in die Vergangenheit, obwohl der Prompt ausdrücklich den vorherigen Tag fordert. |
| Dashboard | PARTIAL | Erledigt, Gesamtzahl, Prozent und Kategorieübersicht sind implementiert. Eine explizite Anzeige der offenen Anzahl fehlt. |
| Dark Mode | PARTIAL / praktisch FAIL | Theme-State und Toggle sind implementiert, die vorgesehenen Utility-Klassen werden jedoch nicht wirksam gestylt. |
| Responsive UI | FAIL im finalen Browser-Check | Die Anwendung erscheint als weitgehend ungestyltes Standard-HTML. |
| Empty States | PARTIAL | Komponenten/Markup existieren, sind durch das Styling-Problem aber nicht wie vorgesehen dargestellt. |
| PWA / Manifest / Service Worker | PARTIAL | `vite-plugin-pwa` ist konfiguriert und ein Manifest wird erzeugt; die im Manifest referenzierten PNG-Icons fehlen im `public`-Verzeichnis. Browser meldet einen Manifest-Icon-Fehler. |
| Offline App-Shell | nicht abschließend verifiziert | Workbox/`generateSW` ist konfiguriert, ein echter Offline-Smoke-Test ist im finalen Zustand nicht belegt. |
| Automatisierte Tests | PARTIAL | Mehrere Unit-/Component-Tests vorhanden, aber kritische End-to-End-Pfade wie Edit/Delete/Navigation/PWA/Styling werden nicht abgedeckt. |
| Lint / TypeScript | weitgehend PASS | Qwen investierte sichtbar viel Arbeit in Lint-/TS-Fixes. Die grüne statische Prüfung konnte jedoch zentrale Laufzeit-/UX-Probleme nicht erkennen. |
| README mit Nutzung/Beispielen | FAIL | `README.md` ist weiterhin im Wesentlichen die Vite-Template-Dokumentation. |

## Wichtigste technische Befunde

### 1. Styling-System ist nicht angeschlossen

Die React-Komponenten verwenden umfangreich Tailwind-artige Utility-Klassen wie `bg-gray-50`, `dark:bg-slate-900`, `max-w-2xl`, `rounded-xl`, `flex`, `gap-*` usw. Im Projekt ist jedoch **kein Tailwind-Paket und keine Tailwind-Konfiguration** vorhanden.

Zusätzlich importiert `src/main.tsx` weder `index.css` noch importiert `App.tsx` `App.css`. Die vorhandene `App.css` enthält außerdem größtenteils übrig gebliebenes Vite-Starter-CSS und bildet die verwendeten Utility-Klassen nicht ab.

Folge: Die Browseransicht ist fast vollständig ungestylt. Dieser Fehler ist im finalen manuellen Browser-Check sofort sichtbar, wurde vom Agenten aber nicht erkannt.

### 2. PWA-Icons fehlen

`vite.config.ts` referenziert:

- `/pwa-192x192.png`
- `/pwa-512x512.png`
- `/pwa-192x192.maskable.png`
- `/pwa-512x512.maskable.png`

Im `public`-Verzeichnis liegen dagegen nur `favicon.svg` und `icons.svg`.

Der Browser meldet entsprechend einen Manifest-Icon-Fehler. Damit ist die geforderte PWA-Installierbarkeit im finalen Zustand nicht sauber erfüllt.

### 3. CRUD ist im UI nicht vollständig

Der State-Layer enthält `addActivity`, `updateActivity` und `deleteActivity`, was zunächst vollständig wirkt. Im UI sind Update und Delete aber nicht sauber verdrahtet:

- `EditActivityForm.tsx` existiert, wird jedoch nicht verwendet.
- `ActivityItem.tsx` kann in einen lokalen Edit-Modus wechseln, speichert diese Änderungen aber nicht zurück in den Context.
- Eine Löschaktion ist im sichtbaren Activity-Flow nicht angebunden.

Das ist ein gutes Beispiel dafür, warum reine Context-/Unit-Tests nicht ausreichen.

### 4. Tagesnavigation enthält einen Anforderungsfehler

Der Prompt fordert ausdrücklich `Heute`, `vorheriger Tag` und `nächster Tag`.

In `App.tsx` beendet `handlePreviousDay()` die Navigation, sobald das aktuelle Datum kleiner oder gleich heute ist. Damit kann vom heutigen Tag aus **nicht in die Vergangenheit navigiert werden**. Auch `DateNavigation.tsx` enthält dazu passende Disable-Logik.

Die Zukunftsregel wurde dagegen korrekt umgesetzt: zukünftige Tage dürfen angezeigt, aber nicht als erledigt markiert werden.

### 5. Tests prüfen wichtige Schichten, aber nicht das Endprodukt

Positiv:

- Storage-Validierung
- beschädigtes JSON
- versionierte Speicherung
- Context-Operationen
- mehrere UI-Basiskomponenten
- Datums-Helfer

Nicht ausreichend abgedeckt:

- echter Edit-Flow über die UI
- echter Delete-Flow über die UI
- Navigation vom heutigen Tag in die Vergangenheit
- PWA-Manifest-Assets
- installierbare PWA
- Offline-Smoke-Test
- vorhandenes/geladenes Styling
- kompletter Browser-Smoke-Test

Dadurch kann ein Test-/Lint-/Build-Lauf grün werden, obwohl das sichtbare Produkt die Anforderungen klar verfehlt.

## Agentenverhalten

### Positiv

- arbeitete über einen langen Zeitraum autonom
- erstellte eine sinnvolle Komponenten-/Context-/Utils-Struktur
- analysierte Compiler-/Lint-Fehler und iterierte selbstständig
- erkannte fehlgeschlagene bzw. wirkungslose Edits und las Dateien erneut ein
- konnte nach einem Infrastruktur-/Compaction-Abbruch auf Basis des Dateisystems weiterarbeiten
- Persistenz und Datenvalidierung sind für die Größe der Aufgabe vergleichsweise solide umgesetzt

### Negativ

- verlor sich relativ lange in Lint-/TypeScript-Detailproblemen
- optimierte auf "Tests/Lint/Build grün", ohne die Anwendung zuverlässig im Browser gegen den Prompt zu prüfen
- übersah einen grundlegenden Stack-Widerspruch: Tailwind-Utility-Klassen ohne Tailwind
- ließ ungenutzte bzw. nicht angebundene Implementierungen zurück (`EditActivityForm`)
- übersah fehlende Manifest-Assets
- erfüllte den README-Teil nicht
- verifizierte zentrale Nutzerpfade nicht vollständig

## Benchmark-Interpretation

Der Lauf zeigt, dass Qwen3-Coder-Next lokal für **agentisches Implementieren, Refactoring und Fehlerbehebung** durchaus brauchbar ist. Besonders die selbstständige Recovery nach dem Session-Abbruch war positiv.

Gleichzeitig zeigt der Test eine klare Schwäche bei **produktbezogener End-to-End-Verifikation**. Das Modell konnte statische Qualitäts-Gates immer weiter reparieren, bemerkte aber nicht, dass die sichtbare Anwendung im Browser praktisch ohne das beabsichtigte Design läuft und einige Kernanforderungen nicht erreichbar sind.

Für spätere Modellvergleiche sollte deshalb nicht nur `test + lint + build` bewertet werden, sondern zusätzlich ein identischer manueller oder automatisierter Browser-Smoke-Test.

## Finaler Status

**Nicht produktionsbereit.**  
**Als Benchmark-Lauf trotzdem sehr wertvoll**, weil er einen deutlichen Unterschied zwischen "Code/Tests sehen plausibel aus" und "das geforderte Produkt funktioniert tatsächlich" sichtbar macht.
