# NOTES — Qwen3-Coder-Next / PulseBoard PWA

## Laufkontext

- Modell: Qwen3-Coder-Next
- Runtime: LM Studio
- Format: MLX 4-bit
- Agent: OpenCode v2
- Kontext: ungefähr 64K
- Jev war als Skill verfügbar, wurde im Prompt aber nicht explizit angefordert.
- Keine MCPs oder Websuche sollten für die eigentliche Aufgabe verwendet werden.

## Auffälligkeiten während des Laufs

### 1. LM-Studio-Hänger nach Prompt-Prefill

Während der ersten Session lief die Implementierung zunächst gut. Später erreichte LM Studio beim Prompt-Processing 100 %, begann aber nicht mehr sauber mit der Ausgabe.

Im LM-Studio-Log erschien wiederholt sinngemäß:

```text
log_prob: Expected number, received nan
communication protocol incompatibility
```

Der Request hing danach, obwohl das Modell bereits vollständig prefilling durchgeführt hatte. RAM-Auslastung lag dabei ungefähr bei 55–58 GB von 64 GB.

Dieser Fehler wurde als Runtime-/Kommunikationsproblem gewertet und nicht als Coding-Fehler des Modells.

### 2. Unterbrochene OpenCode-Compaction

OpenCode begann bei ungefähr halbem angezeigten Kontext mit Compaction. Der erste Compaction-Versuch wurde durch den LM-Studio-Hänger bzw. den manuellen Abbruch unterbrochen.

Danach erschien:

```text
Compaction was interrupted
```

Ein weiterer Compaction-Versuch erzeugte offensichtlich falschen Kontext mit fremden Pfaden wie:

```text
/Users/erik/.../*.mp4
```

Diese Inhalte hatten keinerlei Bezug zum Projekt. Die betroffene Session wurde daher nicht mehr als verlässliche Quelle für den Projektzustand verwendet.

### 3. Recovery aus dem Dateisystem

Für die Fortsetzung wurde Qwen angewiesen, den real vorhandenen Projektstand erneut einzulesen und frühere Compaction-Inhalte nicht als Wahrheit zu behandeln.

Das funktionierte gut: Das Modell setzte die Arbeit anhand der vorhandenen Dateien fort und begann nicht erneut mit der kompletten Projektinitialisierung.

Das ist einer der positivsten Aspekte des Laufs.

## Verhalten beim Bugfixing

Qwen arbeitete anschließend längere Zeit ohne weitere menschliche Coding-Hinweise weiter und behandelte mehrere TypeScript-/ESLint-Probleme selbstständig.

Beobachtetes Muster:

1. Fehler ausführen bzw. lesen
2. Ursache erklären
3. Edit versuchen
4. bei wirkungslosem Edit den aktuellen Dateistand erneut lesen
5. erneut korrigieren
6. Lint/TypeScript wiederholen

Ein konkretes Beispiel war ein Edit, bei dem OpenCode meldete:

```text
No changes to apply: oldString and newString are identical.
```

Qwen reagierte darauf sinnvoll und las die Datei erneut ein, statt den gleichen Edit blind zu wiederholen.

## Finaler Fix-Commit

Der Commit `qwen3-coder-next finish` konzentrierte sich stark auf Lint-/TypeScript-Probleme. Unter anderem wurde die ESLint-Konfiguration umgebaut und Typ-Imports wurden korrigiert.

Das zeigt einen klaren Fokus auf statische Qualitäts-Gates. Genau darin liegt aber auch eine Schwäche dieses Laufs: Der Agent arbeitete sehr lange daran, Lint und TypeScript sauber zu bekommen, ohne anschließend das eigentliche Produkt ausreichend visuell und funktional zu prüfen.

## Manueller Browser-Check

Der finale Stand wurde anschließend im Browser geöffnet.

### Beobachtung 1: UI praktisch ungestylt

Die Seite zeigte im Wesentlichen Browser-Standarddarstellung:

- große Serif-Überschriften
- Standardbuttons
- keine Card-/Grid-/Spacing-Gestaltung
- kein sichtbares modernes Dashboard-Design
- Dark-/Light-Design nicht wie vorgesehen wirksam

### Ursache

Die Komponenten verwenden Tailwind-artige Utility-Klassen, z. B.:

```text
bg-gray-50
max-w-2xl
rounded-xl
dark:bg-slate-900
flex
gap-4
```

Im Projekt ist aber kein Tailwind installiert oder konfiguriert.

Zusätzlich:

- `src/main.tsx` importiert `src/index.css` nicht.
- `src/App.tsx` importiert `src/App.css` nicht.
- `App.css` ist größtenteils übrig gebliebenes Vite-Starter-CSS und würde die verwendeten Utility-Klassen ohnehin nicht bereitstellen.

Das Styling konnte daher im Browser nicht funktionieren.

### Beobachtung 2: Manifest-Icon-Fehler

Chrome meldete:

```text
Error while trying to use the following icon from the Manifest:
/pwa-192x192.maskable.png
(Download error or resource isn't a valid image)
```

`vite.config.ts` referenziert vier PNG-Dateien, die im `public`-Verzeichnis nicht vorhanden sind.

Vorhanden sind nur:

```text
favicon.svg
icons.svg
```

Damit ist die PWA-Konfiguration nicht vollständig.

### Beobachtung 3: Chrome runtime.lastError

Zusätzlich erschien:

```text
Unchecked runtime.lastError: A listener indicated an asynchronous response...
```

Dieser Fehler ist häufig mit Browser-Erweiterungen bzw. Chrome-Message-Channels verbunden. Ohne weitere Reproduktion sollte er **nicht** dem PulseBoard-Code zugerechnet werden.

## Funktionale Source-Review-Funde

### Bearbeiten nicht fertig verdrahtet

`EditActivityForm.tsx` ist vorhanden und kann eine Aktivität über `updateActivity` speichern, wird im sichtbaren App-Flow aber nirgends eingebunden.

`ActivityItem.tsx` besitzt zusätzlich einen eigenen lokalen Edit-Modus. Dort können Name und Beschreibung verändert werden, aber es gibt keinen Save-/Commit-Pfad zurück in `AppContext`.

Das Ergebnis ist eine vorhandene Implementierungsschicht ohne vollständigen Nutzerpfad.

### Löschen nicht im UI angebunden

`deleteActivity()` ist im Context korrekt vorhanden und entfernt auch zugehörige Tagesstatus-Einträge.

In der sichtbaren Aktivitäts-UI gibt es jedoch keinen angebundenen Delete-Flow.

### Vorheriger Tag fehlerhaft

Der Prompt fordert explizit Navigation zum vorherigen Tag.

In `App.tsx` enthält `handlePreviousDay()` jedoch:

```ts
if (current <= today) return;
```

Damit kann vom aktuellen Tag aus nicht in die Vergangenheit navigiert werden.

Die UI-Disable-Logik in `DateNavigation.tsx` folgt demselben Konzept.

### Zukunftsregel korrekt

Die andere Hälfte der Datumsanforderung wurde richtig verstanden:

- zukünftige Tage können angezeigt werden
- Status-Toggle ist dort gesperrt
- Tagesziel-Werte können dort ebenfalls nicht verändert werden

### Persistenz vergleichsweise stark

Die Persistenz ist einer der besseren Teile des Ergebnisses:

- Version im gespeicherten Datenobjekt
- Strukturvalidierung
- Prüfung einzelner Activity-/Status-Felder
- beschädigtes JSON führt auf Initialzustand zurück
- unbekannte Version führt ebenfalls auf sicheren Initialzustand zurück

Für die Größe des Benchmarks ist das ordentlich.

## Testabdeckung

Vorhanden sind u. a. Tests für:

- Storage-Validierung
- beschädigte Daten
- Datums-Helfer
- Context-Operationen
- AddActivityForm-Basisverhalten
- Button / Card / EmptyState
- Dashboard-Unterkomponenten
- ActivityItem

Auffällige Lücken:

- kein echter UI-Test für Aktivität bearbeiten
- kein echter UI-Test für Aktivität löschen
- kein Test für Navigation `Heute -> vorheriger Tag`
- kein Test, der prüft, ob das CSS tatsächlich geladen wird
- kein Test für fehlende Manifest-Assets
- kein PWA-Installations-Smoke-Test
- kein Offline-Smoke-Test
- kein kompletter Nutzerfluss im Browser

Gerade diese Lücken erklären, wie der Agent statische Checks erfolgreich reparieren konnte, während das Endprodukt sichtbar fehlerhaft blieb.

## README

Der finale `README.md` ist weiterhin im Wesentlichen die Standard-Vite-Dokumentation.

Der Prompt verlangte eine kurze README mit Benutzung und Beispielen. Dieser Punkt wurde nicht umgesetzt.

## Benchmark-Lernpunkte

Dieser Lauf sollte für spätere Modelle möglichst unverändert als Referenz erhalten bleiben.

Besonders interessant sind folgende Vergleichspunkte:

- Erkennt ein anderes Modell selbstständig den fehlenden CSS-/Tailwind-Stack?
- Öffnet bzw. prüft es die App tatsächlich im Browser?
- Erkennt es fehlende PWA-Icons?
- Prüft es CRUD wirklich über die UI statt nur im State-Layer?
- testet es die Tagesnavigation entsprechend dem Prompt?
- bleibt es weniger lange in Lint-/Config-Details hängen?
- schreibt es die verlangte README?

## Empfehlung für zukünftige Benchmark-Auswertung

Den Prompt selbst würde ich zunächst **nicht** anpassen. Die Anweisung zur finalen Verifikation war bereits vorhanden. Wenn andere Modelle denselben Fehler vermeiden, ist das ein wertvoller Qualitätsunterschied.

Zusätzlich zur Agentenmeldung sollten aber immer dieselben externen Checks durchgeführt werden:

1. `npm test`
2. `npm run lint`
3. `npm run build`
4. App im Browser öffnen
5. Aktivität hinzufügen
6. Aktivität bearbeiten
7. Aktivität löschen
8. Heute / gestern / morgen prüfen
9. zukünftige Aktivität abhaken versuchen
10. Reload und Persistenz prüfen
11. Manifest/PWA-Konsole prüfen
12. Offline-Modus prüfen

So wird verhindert, dass ein Modell nur auf statische Gates optimiert und trotzdem einen sichtbar kaputten Endzustand abliefert.
