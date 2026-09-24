# NOTES — Qwen3-Coder-30B-A3B-Instruct / PulseBoard PWA

## Laufkontext

- Datum: 2026-09-24
- Modell: Qwen3-Coder-30B-A3B-Instruct
- Runtime: LM Studio
- Agent: OpenCode v2
- Kontext: 65.536 Tokens nach erneutem Laden des Modells
- Benchmark-Prompt: `instructions.md`
- Keine MCPs, Websuche oder externen Hilfsmittel für die eigentliche Aufgabe
- Quantisierung/Sampling des finalen Runs sind nach dem LM-Studio-Reload nicht zuverlässig dokumentiert und werden daher nicht bewertet.

Wichtig: LM Studio hatte beim erneuten Laden die Model-Settings zwischenzeitlich zurückgesetzt. Der Kontext wurde anschließend wieder auf 65.536 gesetzt. Frühere Compaction-Auffälligkeiten dürfen deshalb nicht ausschließlich dem Modell zugerechnet werden.

## Verlauf des Runs

### 1. Erste Session: Fortschritt, dann Write-Loop

Qwen begann selbstständig mit der PulseBoard-Implementierung und erzeugte eine React-/TypeScript-/Vite-Struktur.

Noch vor einer nächtlichen macOS-Unterbrechung war die Session bereits in einen wiederholten Write-Zyklus geraten. Typisches Muster:

```text
Let me create the main.tsx file:
←Write
Let me create the main.tsx file:
←Write
...
⚠ Retry due · Decode error (200 POST ... /v1/chat/completions)
```

Nach dem System-Update wurde die Session fortgesetzt, geriet aber beim Erzeugen weiterer Dateien erneut in dasselbe Muster.

Die Unterbrechung durch das macOS-Update war daher nicht die alleinige Ursache des Scheiterns; der Loop war bereits vorher sichtbar.

### 2. Compaction-Auffälligkeiten

In einer Fortsetzungs-Session lief OpenCode sehr früh in Compaction. Der erzeugte Summary-State enthielt mehrfach identische Dateipfade und widersprüchliche Zustandsaussagen.

Später schlug ein weiterer Versuch mit folgender Meldung fehl:

```text
Compaction summary did not match the required template
```

Da LM Studio zu diesem Zeitpunkt seine Context-Einstellung zurückgesetzt hatte, wird die frühe Compaction **nicht als reiner Modellfehler** gewertet.

Die Qualität des erzeugten Compaction-Texts war trotzdem auffällig:

- mehrfach duplizierte `Relevant Files`
- bereits als erledigt deklarierte Analyse, die direkt danach erneut begonnen wurde
- kein stabiler, sauberer Recovery-State

### 3. Neustart mit 65.536 Context

Nach Wiederherstellung von 65.536 Tokens Context wurde ein neuer Versuch gestartet.

Qwen konnte zunächst:

- das Projektverzeichnis korrekt erkennen
- mehrere Dateien lesen
- die vorhandene React-/TypeScript-Struktur nachvollziehen
- nach einem einzelnen Decode-Retry weiterarbeiten

Dabei trat erneut mindestens ein Fehler auf:

```text
⚠ Retry due · attempt 2 · Decode error
(200 POST http://127.0.0.1:1234/v1/chat/completions)
```

Der HTTP-200-Decode-Fehler wird als **Runtime-/Tool-Protokollproblem der Kombination OpenCode + LM Studio + Modell** dokumentiert und nicht isoliert als Coding-Fehler von Qwen bewertet.

### 4. Task Drift

Nach dem Source-Read begann Qwen eigene Verbesserungen zu planen, obwohl die Aufgabe primär darin bestand, den bestehenden Stand zu prüfen und die ursprüngliche Benchmark-Aufgabe vollständig zu Ende zu führen.

Beobachtet wurde unter anderem:

- widersprüchliche Aussage zur Persistenz: zunächst sei LocalStorage aktiv, kurz darauf fehle persistente Speicherung
- Fokus auf Dashboard-/Checkbox-Verbesserungen, obwohl wesentliche Prompt-Anforderungen wie PWA, Datumsnavigation und Tests noch nicht umgesetzt waren
- kein systematischer erneuter Abgleich gegen `instructions.md`

Das deutet auf schwache Priorisierung über längere Agentenläufe hin.

### 5. Finaler Repair-Loop in `App.tsx`

Der finale Abbruchgrund war ein klarer, reproduzierbarer Reparatur-Loop.

Qwen erkannte selbst, dass in `App.tsx` wiederholt

```tsx
<div className="activity-checkbox">
```

dupliziert worden war. Anschließend versuchte es mehrfach, genau diesen Bereich zu ersetzen, erzeugte aber erneut denselben bzw. weiterhin kaputten Block.

Zusätzlich scheiterten alternative Reparaturversuche mit:

```text
ReferenceError: Unknown identifier 'require'.
```

Danach folgte ein Muster aus:

1. Datei erneut lesen
2. denselben JSX-Befund formulieren
3. nahezu denselben Fix ankündigen
4. keinen Fortschritt erzielen
5. wieder lesen
6. denselben Befund erneut formulieren

Am Ende wiederholte die Ausgabe dutzendfach praktisch denselben Satz über das angebliche JSX-Problem in Zeile 154.

Der Run wurde an dieser Stelle manuell abgebrochen und der Zustand unverändert als Benchmark-Artefakt gepusht.

## Review des gepushten Endstands

### `App.tsx`: nicht buildfähig

Im finalen Source stehen im Activity-Item-Block zahlreiche direkt aufeinanderfolgende Öffnungen von:

```tsx
<div className="activity-checkbox">
```

ohne passende Closing-Tags.

Damit ist der JSX-Baum syntaktisch nicht ausgeglichen. Ein erfolgreicher finaler Production Build ist mit diesem Stand nicht möglich.

Der Defekt passt direkt zum beobachteten Agenten-Loop: Qwen erkannte die Duplikation, verstärkte sie durch wiederholte Edits aber weiter.

### Zwei konkurrierende Implementierungsansätze

Neben der direkt in `App.tsx` implementierten UI existieren separate Komponenten:

- `Header.tsx`
- `Dashboard.tsx`
- `ActivityList.tsx`
- `ActivityItem.tsx`

Diese werden im finalen `App.tsx` nicht verwendet.

Dadurch existieren zwei teilweise unterschiedliche Implementierungen derselben Oberfläche. Das erhöht Inkonsistenz und Dead Code.

Beispiel: `ActivityItem.tsx` besitzt zwar einen Checkbox-Handler, dieser enthält aber nur:

```ts
// In a real implementation, this would update the activity's completed status
```

Die Komponente ist also selbst funktional nicht fertig.

### Aktivitätsmodell nur teilweise umgesetzt

Der Prompt fordert pro Aktivität:

- Name
- optionale Beschreibung
- Kategorie
- optionales Tagesziel

Im final angebundenen Flow kann nur ein Name angelegt und bearbeitet werden.

Beschreibung, Kategorie und Tagesziel sind über die tatsächlich verwendete UI nicht erfassbar.

### Tagesstatus / Datumsnavigation fehlen

Der finale State speichert:

```ts
{
  id,
  name,
  completed
}
```

`completed` gehört damit global zur Aktivität und nicht zu einem Kalendertag.

Folgen:

- Tagesstatus verschiedener Tage ist nicht getrennt
- vorheriger/nächster Tag fehlt
- Zukunftstage fehlen
- die Regel „Zukunft anzeigen, aber nicht abhaken“ kann nicht erfüllt werden

`DateState` existiert lediglich als ungenutzter Typ.

### Persistenz nur rudimentär

Positiv:

- LocalStorage wird verwendet
- ein `version: "1.0"`-Feld wird geschrieben
- beschädigtes JSON wird über `try/catch` abgefangen

Nicht erfüllt:

- die gespeicherte Version wird beim Laden nicht geprüft
- keine Schema-Validierung
- keine Migration
- syntaktisch gültige, aber strukturell falsche Daten können in `activities` gelangen und die App später zum Absturz bringen

Damit ist die Anforderung „ungültige oder veraltete gespeicherte Daten dürfen die App nicht zum Absturz bringen“ nicht ausreichend umgesetzt.

### PWA fehlt

`vite.config.ts` enthält ausschließlich React-/Vite-Konfiguration.

Es fehlen:

- Manifest
- Service Worker
- PWA-Plugin oder eigener SW-Setup
- App-Icons
- Offline-App-Shell

Die PWA-Anforderungen wurden im finalen Stand praktisch nicht begonnen.

### Tests / Lint / Build nicht abgeschlossen

`package.json` enthält:

```json
"test": "vitest"
```

`vitest` ist dort aber nicht als Dependency oder DevDependency deklariert.

Außerdem:

- keine eigentlichen `*.test.*`-Dateien im gepushten Run
- nur ein minimales `src/test/setup.ts`
- `vitest.config.ts` verwendet `environment: "vitest"` statt einer passenden Browser-Testumgebung wie `jsdom`
- kein Lint-Script
- keine belegte abschließende Test-/Lint-/Build-Verifikation
- finaler JSX-Stand ist bereits statisch nicht buildfähig

## Agentenverhalten

### Positiv

- Projektstruktur und vorhandene Dateien konnten grundsätzlich gelesen werden
- nach einzelnen Decode-Retries konnte der Agent teilweise weiterarbeiten
- Qwen erkannte mehrfach die tatsächliche Problemzone im JSX
- einige Basisfunktionen wie Add/Edit/Delete, LocalStorage, Dashboard-Berechnung und CSS wurden zumindest angefangen
- Dark-Mode-/Responsive-Grundideen sind im CSS vorhanden

### Negativ

- wiederholte Tool-/Decode-Probleme
- mehrfach identische oder wirkungslose Edit-Versuche
- falsche Nutzung eines Execute-Kontexts mit `require`
- erkannter Codefehler wurde durch weitere Edits verschlimmert
- keine robuste „Stop, re-read, rebuild from known-good section“-Strategie
- starke sprachliche und gedankliche Repetition im Repair-Loop
- Task Drift weg vom vollständigen Prompt-Abgleich
- keine finale Verifikation
- Kernanforderungen PWA, Datum, Tests und robuste Persistenz blieben offen

## Benchmark-Lernpunkte

Dieser Run zeigt eine andere Fehlerklasse als der vorherige Qwen3-Coder-Next-Lauf.

Qwen3-Coder-Next erreichte einen großen, weitgehend strukturierten Projektstand und scheiterte vor allem an End-to-End-/Produktverifikation.

Qwen3-Coder-30B-A3B-Instruct scheiterte deutlich früher an **agentischer Stabilität und Tool-Nutzung**:

- Tool Calls konnten teilweise erfolgreich sein
- das Modell konnte Fehler erkennen
- es konnte aber aus wiederholt fehlgeschlagenen Reparaturversuchen keine neue belastbare Strategie ableiten

Für zukünftige Tests sollte dieser Run unverändert als FAIL-Artefakt erhalten bleiben. Gerade der beschädigte Endstand ist wichtig, weil er sichtbar macht, dass der Agent nicht nur „nicht fertig“ wurde, sondern den betroffenen Code im Reparaturprozess weiter verschlechterte.

## Für spätere Re-Tests

Ein separater Kompatibilitätstest mit demselben Modell über eine andere lokale Runtime, z. B. direkt über llama.cpp statt LM Studio, wäre sinnvoll.

Das sollte aber als **separater Runtime-Test** dokumentiert werden und den jetzigen Benchmark-Run nicht ersetzen oder nachträglich „reparieren“.
