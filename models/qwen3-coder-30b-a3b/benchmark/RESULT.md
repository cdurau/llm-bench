# RESULT — Qwen3-Coder-30B-A3B-Instruct / PulseBoard PWA

**Datum:** 2026-09-24  
**Modell:** Qwen3-Coder-30B-A3B-Instruct  
**Runtime:** LM Studio  
**Agent:** OpenCode v2  
**Kontext:** 65.536 Tokens im finalen Versuch  
**Benchmark-Prompt:** `instructions.md`

## Kurzfazit

Der Lauf ist **fehlgeschlagen und wurde wegen eines wiederholten Agenten-/Repair-Loops manuell abgebrochen**.

Qwen konnte den vorhandenen Projektstand lesen, eine React-/TypeScript-/Vite-Grundstruktur aufbauen und einzelne Basisfunktionen wie Add/Edit/Delete, LocalStorage, Dashboard-Berechnung, Dark-Mode-CSS und responsive CSS-Ansätze beginnen.

Der Agent erreichte jedoch weder einen vollständigen Funktionsumfang noch die verlangten Qualitäts-Gates. Im finalen Zustand ist `src/App.tsx` durch wiederholt eingefügte, nicht korrekt geschlossene JSX-`div`-Elemente syntaktisch beschädigt. Der beobachtete Repair-Loop erkannte diese Problemzone mehrfach, konnte sie aber nicht beheben und verschlechterte den Source weiter.

Zusätzlich fehlen zentrale Anforderungen vollständig oder weitgehend: tagesbezogener Status, Datumsnavigation, PWA/Offline-Funktionalität, robuste versionierte Persistenz, automatisierte Tests, Linting und eine erfolgreiche Production-Build-Verifikation.

**Benchmark-Ergebnis: FAIL — Agentenlauf abgebrochen, finaler Stand nicht buildfähig.**

## Einordnung der Runtime-Probleme

Während des Runs traten mehrfach Fehler der Form

```text
Decode error (200 POST http://127.0.0.1:1234/v1/chat/completions)
```

auf.

Diese Fehler werden **nicht allein dem Modell zugerechnet**, weil sie an der Schnittstelle OpenCode / LM Studio / Modell auftreten.

Auch eine sehr frühe Compaction-Phase wird nicht als reiner Modellfehler bewertet, da LM Studio beim Reload zwischenzeitlich die Context-Einstellung zurückgesetzt hatte.

Unabhängig davon bleibt der finale Repair-Loop ein eigenständiger negativer Befund: Qwen konnte Dateien erfolgreich lesen und Tool-Ergebnisse sehen, wiederholte danach aber weiterhin dieselbe fehlerhafte Reparaturstrategie.

## Anforderungsabgleich

| Bereich | Status | Beobachtung |
|---|---|---|
| React / TypeScript / Vite | PARTIAL | Grundstruktur vorhanden, finaler JSX-Stand ist jedoch nicht buildfähig. |
| Keine Backend-/Webdienste | PASS | Im gepushten Source sind keine externen Backend- oder Webdienst-Abhängigkeiten erkennbar. |
| Aktivität hinzufügen | PARTIAL | Name kann angelegt werden; Beschreibung, Kategorie und Tagesziel fehlen im angebundenen Add-Flow. |
| Aktivität bearbeiten | PARTIAL | Im direkten `App.tsx`-Flow kann nur der Name per `prompt()` geändert werden. |
| Aktivität löschen | PARTIAL | Delete-Handler vorhanden, aber der finale Stand ist insgesamt nicht lauffähig. |
| Beschreibung | FAIL | Im tatsächlich verwendeten Add-/Edit-Flow nicht erfassbar. |
| Kategorie | FAIL | Kein Eingabeflow; Dashboard fällt dadurch praktisch auf `uncategorized` zurück. |
| Optionales Tagesziel | FAIL | Im finalen Modell/Flow nicht umgesetzt. |
| Tagesstatus pro Kalendertag | FAIL | `completed` wird direkt an der Aktivität gespeichert, nicht datumsbezogen. |
| Reload-Persistenz des Status | PARTIAL | LocalStorage vorhanden, aber nur für den globalen Aktivitätsstatus. |
| Vorheriger / nächster Tag / Heute | FAIL | Keine Datumsnavigation implementiert. |
| Zukunftstag anzeigen, aber nicht abhaken | FAIL | Ohne Datumsmodell/-navigation nicht umgesetzt. |
| Dashboard: erledigt | PASS / technisch begonnen | Erledigte Anzahl wird berechnet. |
| Dashboard: offen | PARTIAL | Gesamtzahl wird angezeigt, eine explizite offene Anzahl fehlt. |
| Dashboard: Fortschritt % | PASS / technisch begonnen | Prozentberechnung vorhanden. |
| Dashboard: Kategorien | PARTIAL | Berechnung existiert, aber Kategorien können im angebundenen UI nicht gepflegt werden. |
| Versionierte Persistenz | PARTIAL | `version: "1.0"` wird geschrieben, beim Laden aber nicht geprüft. |
| Beschädigte/veraltete Daten robust | FAIL / teilweise | Ungültiges JSON wird abgefangen; strukturell falsche oder veraltete gültige Daten werden nicht validiert. |
| PWA Manifest | FAIL | Nicht vorhanden. |
| Service Worker | FAIL | Nicht vorhanden. |
| Installierbarkeit / Icons | FAIL | Nicht umgesetzt. |
| Offline App-Shell | FAIL | Nicht umgesetzt. |
| Responsive UI | PARTIAL | CSS enthält einen Mobile-Breakpoint; finaler Build ist jedoch kaputt. |
| Dark Mode | PARTIAL | CSS-/State-Grundlage vorhanden; im finalen Zustand nicht end-to-end verifiziert. |
| Tastaturbedienung | PARTIAL | Add per Enter und Button-`aria-label` sind vorhanden; Gesamt-UX nicht vollständig geprüft. |
| Empty State | PASS / technisch begonnen | Einfacher Empty State vorhanden. |
| Sinnvolle Fehlermeldungen | FAIL / schwach | Im UI praktisch nicht umgesetzt. |
| Automatisierte Tests | FAIL | Keine eigentlichen Testdateien vorhanden. |
| Test-Setup | FAIL | `vitest` wird als Script aufgerufen, ist in `package.json` aber nicht deklariert; Test-Environment ist zudem falsch konfiguriert. |
| Linting | FAIL | Kein Lint-Script und keine abschließende Lint-Verifikation. |
| Production Build | FAIL | Finales `App.tsx` enthält einen strukturell kaputten JSX-Baum; kein erfolgreicher Abschluss-Build belegt. |
| Selbstständige Endverifikation | FAIL | Der Agent blieb vor Abschluss in einem Repair-Loop hängen und wurde manuell abgebrochen. |

## Wichtigste technische Befunde

### 1. Finales `App.tsx` ist durch den Repair-Loop beschädigt

Im Activity-Item-Bereich enthält der gepushte Source eine lange Folge direkt aufeinanderfolgender:

```tsx
<div className="activity-checkbox">
```

mit nicht passenden Closing-Tags.

Der Agent hatte genau diese Duplikation selbst identifiziert, versuchte sie aber mehrfach mit wirkungslosen bzw. erneut fehlerhaften Edits zu reparieren.

Das ist für den Benchmark besonders relevant: Der Agent scheiterte nicht nur daran, einen Fehler zu finden, sondern **verschlechterte denselben Bereich während der Reparatur weiter**.

### 2. Der Agent erkannte fehlenden Fortschritt nicht zuverlässig

Der finale Ablauf bestand wiederholt aus Varianten von:

```text
Looking at line 154, there's an issue with the JSX structure...
```

gefolgt von erneutem Lesen oder einem weiteren nahezu identischen Reparaturversuch.

Die Ausgabe wiederholte denselben Befund schließlich dutzendfach, ohne die Strategie zu wechseln.

Damit fehlt eine wichtige agentische Fähigkeit:

> Nach mehreren fehlgeschlagenen Patch-Versuchen einen bekannten schlechten Ansatz aufzugeben und den Bereich kontrolliert neu aufzubauen.

### 3. Parallel entstandene Komponenten werden nicht verwendet

Es existieren separate Komponenten für:

- Header
- Dashboard
- ActivityList
- ActivityItem

Der finale `App.tsx` implementiert dieselben Bereiche jedoch nochmals direkt.

Dadurch gibt es zwei auseinanderlaufende Implementierungen.

Besonders auffällig: Der Checkbox-Handler in `ActivityItem.tsx` ist nur ein Platzhalter:

```ts
// In a real implementation, this would update the activity's completed status
```

Die modularere Variante war also ebenfalls nicht fertig.

### 4. Das Datenmodell verfehlt den Kern des Benchmarks

Der tatsächlich verwendete Aktivitäts-State reduziert sich im Wesentlichen auf:

```ts
{
  id,
  name,
  completed
}
```

Damit fehlen gerade die Teile, die den Benchmark anspruchsvoller als eine normale Todo-App machen:

- Kategorie als pflegbares Feld
- optionale Beschreibung
- Tagesziel
- Status getrennt pro Datum
- Datumsnavigation
- Zukunftsregel

Der finale Stand ist daher funktional näher an einer einfachen Todo-Liste als an der geforderten PulseBoard-PWA.

### 5. Persistenz ist vorhanden, aber nicht robust genug

Positiv ist, dass Qwen LocalStorage und ein Versionsfeld vorgesehen hat.

Die Version ist jedoch rein deklarativ:

```ts
const dataToSave = {
  version: '1.0',
  activities,
};
```

Beim Laden wird sie weder geprüft noch migriert.

Nur JSON-Syntaxfehler werden abgefangen. Ein gültiges JSON mit falscher Struktur kann weiterhin problematische Werte in den State bringen.

### 6. PWA-Anforderungen wurden nicht umgesetzt

In `vite.config.ts` gibt es nur:

- React Plugin
- Dev-Server-Port
- Build-Ausgabepfad

Manifest, Service Worker, Icons und Offline-App-Shell fehlen vollständig.

Damit ist einer der zentralen Benchmark-Bereiche klar nicht erfüllt.

### 7. Quality Gates wurden nicht erreicht

Der Prompt fordert ausdrücklich:

- automatisierte Tests
- Lint
- Production Build
- selbstständige Fehlerkorrektur
- tatsächliche Endverifikation

Im finalen Stand:

- keine Testfälle
- `vitest` nicht als Projektdependency deklariert
- fehlerhafte Vitest-Environment-Konfiguration
- kein Lint-Script
- kein erfolgreicher finaler Build
- syntaktisch beschädigtes JSX

Damit ist das Qualitätsziel deutlich verfehlt.

## Agentenverhalten

### Positiv

- konnte das Repo und vorhandene Dateien grundsätzlich erfassen
- Reads und einzelne Edits funktionierten
- erkannte die relevante JSX-Problemzone
- konnte sich nach einzelnen Decode-Retries zeitweise erholen
- begann mehrere funktionale Bereiche eigenständig
- erzeugte ein zumindest erkennbares UI-/CSS-Grundkonzept

### Negativ

- mehrfach instabile Tool-/Decode-Kommunikation
- wiederholte identische oder wirkungslose Edits
- falsche Execute-Strategie mit `require`
- zunehmende Repetition statt Strategiewechsel
- beschädigte den Problemabschnitt während der Reparatur weiter
- verlor den vollständigen Benchmark-Prompt aus dem Fokus
- keine systematische Restanforderungsanalyse
- keine finale Test-/Build-Verifikation

## Vergleich zum bisherigen Qwen3-Coder-Next-Lauf

Der Unterschied zum vorherigen Qwen3-Coder-Next-Test ist deutlich:

**Qwen3-Coder-Next**

- erreichte eine wesentlich umfangreichere Architektur
- implementierte Tests und robuste Storage-Logik
- konnte lange autonom Fehler beheben
- scheiterte vor allem an Produkt-/Browser-Endverifikation und einzelnen nicht verdrahteten Features

**Qwen3-Coder-30B-A3B-Instruct**

- blieb wesentlich früher stecken
- setzte zentrale Anforderungen gar nicht um
- erreichte keine belastbaren Quality Gates
- geriet beim Reparieren eines lokalen JSX-Problems in einen hartnäckigen Loop
- hinterließ einen nicht buildfähigen Endstand

Der aktuelle Run misst dabei nicht nur reine Codequalität, sondern auch die praktische **Agentenkompatibilität mit OpenCode + LM Studio**. Die beobachteten Decode-Fehler sollten deshalb bei einem späteren Runtime-Vergleich separat kontrolliert werden.

## Benchmark-Interpretation

Dieser Lauf ist als FAIL trotzdem wertvoll.

Er zeigt, dass ein Modell einen Fehler korrekt benennen kann, ohne ihn agentisch zuverlässig reparieren zu können. Für lokale Coding-Agenten ist genau diese Fähigkeit entscheidend: Nicht nur Code erzeugen, sondern Tool-Ergebnisse auswerten, fehlgeschlagene Strategien verwerfen und einen stabilen Abschlusszustand erreichen.

Ein späterer Re-Test desselben Modells über eine andere Runtime kann klären, wie viel der Tool-Instabilität auf LM Studio/OpenCode zurückgeht.

Der jetzige Run sollte dafür **unverändert als eigener Benchmark-Datensatz erhalten bleiben**.

## Finaler Status

**FAIL / manuell abgebrochen.**

- Nicht buildfähig
- Kernfunktionen fehlen
- PWA fehlt
- Tests/Lint fehlen
- Datumslogik fehlt
- Persistenz nur teilweise robust
- Agent geriet in wiederholten Repair-Loop

Der gepushte beschädigte Source ist bewusst Teil des Ergebnisses und sollte nicht nachträglich korrigiert werden.
