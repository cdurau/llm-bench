# llm-bench

Reproduzierbares Artefakt-Repository für Benchmarks lokaler Coding-LLMs.

## Source of Truth

Dieses Projekt trennt technische Artefakte bewusst von der lesbaren Auswertung:

- **GitHub** enthält Benchmark-Prompts, erzeugten Code, Configs, rohe Session-Exporte/Logs und weitere reproduzierbare Artefakte.
- **Notion** enthält Run-Auswertungen, Vergleiche, Erkenntnisse, Entscheidungen und die Benchmark-Methodik.

Notion-Projekt: https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f  
Benchmark Runs: https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86  
Methodik: https://app.notion.com/p/3e58253ebb2481c5b3a5e88723c25c3e  
Prompt-Seiten: [PulseBoard](https://app.notion.com/p/3e58253ebb2481559131f2672aacc765), [Habit-Tracker](https://app.notion.com/p/3e98253ebb248154bfc2ed1a92e13f2d)

## Runtime- und Modellformat-Strategie

Stand 2026-09-27 ist der Benchmark bewusst auf das praktische Ziel ausgerichtet: zuverlässige lokale Coding-Agenten auf Apple Silicon, die mittelgroße bis komplexe Anwendungen mit minimalem manuellem Eingreifen bauen können.

- **Primärer Pfad: oMLX + MLX.** Das ist der Standard für ernsthafte neue Coding-Benchmark-Läufe und die aktuelle Referenzplattform.
- **Vergleichspfad: Ollama + MLX.** Ausgewählte starke Modelle können unter kontrollierten Bedingungen gegen oMLX getestet werden, insbesondere bei Tool-Calling, TTFT, Decode-Geschwindigkeit, Speicherbedarf und Agenten-Stabilität.
- **Modell-Labor / Fallback: LM Studio + MLX/GGUF.** LM Studio bleibt nützlich, um neue Modelle schnell zu laden und zu untersuchen und für Kompatibilitätschecks, ist aber nicht mehr die primäre Benchmark-Runtime.
- **GGUF ist ein gezielter Nebenpfad.** Nutze es, wenn ein interessantes Modell/Finetune nicht sinnvoll als MLX verfügbar ist oder GGUF einen konkreten Vorteil bietet. Das Projekt strebt keine 50:50-Aufteilung zwischen MLX und GGUF an.
- Als grobe Richtlinie sollten **80–90 % der relevanten Modell-Exploration MLX nutzen**. Nicht jede Quantisierung in jeder Runtime testen, solange der Vergleich keine konkrete Frage beantwortet.
- Vielversprechende **27–40B Dense/MoE**-Modelle und größere **50–70B MoE- oder stark quantisierte Modelle** priorisieren, wenn sie genug Speicher-Headroom für Runtime, KV-Cache und Coding-Agent lassen.
- **100–120B-Experimente sind selektiv**, kein Standard-Suchpfad. Die Lade-/Inferenz-Experimente mit Nemotron 120B sind ein Beispiel dafür, dass Runtime-Komplexität und Speicherdruck den praktischen Nutzen überwiegen können.
- Bei einem besonders starken Kandidaten kann ein kontrollierter **oMLX-vs-Ollama-MLX**-Folgetest dasselbe Modell anhand von TTFT, Decode-Geschwindigkeit, RAM, Tool-Call-Erfolg, Agenten-Stabilität und dem finalen PulseBoard-Ergebnis vergleichen.

Die aktuelle praktische Referenz ist **Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp + oMLX**. Neue Kandidaten werden vor allem am kombinierten Ergebnis aus Qualität, Geschwindigkeit, Speicherbedarf und agentischer Zuverlässigkeit gemessen, nicht allein an rohen Tokens/s. Die ausführliche Runtime-Begründung und laufende Erkenntnisse stehen weiter in der Notion-Seite **Inference Provider & Runtime Vergleich**.

## PulseBoard-Benchmark

Der ursprüngliche kanonische, reproduzierbare Prompt ist [`instructions.md`](./instructions.md).

Läufe mit dem erweiterten Agenten-Workflow mit `frontend-design`, Jev und Projekt-Memory-Dokumentation nutzen [`instructions_jev_frontend-skill.md`](./instructions_jev_frontend-skill.md). Diese Läufe sind nicht direkt mit Läufen vergleichbar, die den ursprünglichen Prompt nutzen.

Regeln für Agenten und Dokumentation stehen in [`AGENTS.md`](./AGENTS.md).

### Laufzeitmessung

Die Benchmark-Laufzeit wird **aus den gesicherten OpenCode-/Session-Logs abgeleitet**, nicht manuell aus Chat-Nachrichten oder der Erinnerung an die Uhrzeit geschätzt.

- Bevorzugt werden die Zeitstempel in `benchmark/session01.json` (oder dem entsprechenden rohen Session-Export) als kanonische Quelle.
- Bei einem abgeschlossenen Lauf wird die verstrichene Agenten-Laufzeit vom Start-/Erstellungszeitstempel der Session bis zum letzten abgeschlossenen/Idle-Zeitstempel berechnet.
- Bei einem unterbrochenen oder gescheiterten Lauf wird die verstrichene Zeit nur bis zum aufgezeichneten Unterbrechungs-/Abbruchpunkt berechnet und ausdrücklich als **Zeit bis Abbruch/Fehler** gekennzeichnet, nicht als Abschlusszeit.
- Manuelle Fortsetzungs-Prompts bleiben Teil desselben Laufs. Ihre Verzögerungen werden anhand der Session-Timeline interpretiert und nicht geraten.
- Laufzeitwerte, die nach Notion übernommen werden, sollen daher aus den GitHub-Artefakten reproduzierbar sein. Ist ein rohes Session-Log vorhanden, wird dieser extrahierte Wert manuell berichteten Dauern vorgezogen.
- Laufzeit bleibt getrennt von Inferenz-Metriken wie TTFT, Prompt-Processing-Geschwindigkeit und Decode-tok/s. Der Benchmark nutzt beides: Inferenz-Metriken beschreiben die Geschwindigkeit von Modell/Runtime, während die verstrichene Session-Zeit die praktische **Time-to-Result** der Coding-Agent-Aufgabe misst.

Für künftige Benchmark-Auswertungen ist die Laufzeit-Extraktion aus den Logs ein Standard-Auswertungsschritt neben Build/Tests, funktionaler Verifikation, Tool-Nutzungs-Stabilität und UI/PWA-Inspektion.

## Todo-PWA (Vorversuch)

Vor PulseBoard gab es einen kleinen Vorversuch mit einer Todo-PWA. Der Prompt ist [`todo_prompt.md`](./todo_prompt.md). Der einzige Lauf dazu ist `models/qwen3/qwen3.8-27b-ollama/qwen3.8-27b-ollama-test1/` (Ollama, in Notion als INFRA bewertet).

## Hardware

Die Referenzhardware für alle Läufe steht in [`HARDWARE.md`](./HARDWARE.md). Abweichungen werden beim jeweiligen Run dokumentiert.

## Habit-Tracker-Benchmark („Rhythm")

Zweite Benchmark-Aufgabe nach PulseBoard: ein Habit- und Stimmungs-Tracker als PWA mit Fokus auf Designqualität und Skill-Nutzung (`minimalist-ui`, `vite-pwa-patterns`, optional Jev). Prompt, Installations-Skripte und Anleitung stehen in [`tests/habit-tracker/`](./tests/habit-tracker/README.md).

Die Ergebnisse liegen **pro Projekt statt pro Modell** unter `tests/habit-tracker/<modellname>/`, nicht in der `models/`-Struktur von PulseBoard. Die Regel bleibt dieselbe: Das vom Modell erzeugte Ergebnis wird unverändert gesichert.

## Repository-Struktur

```text
instructions.md                         # kanonischer PulseBoard-Prompt
instructions_jev_frontend-skill.md      # erweiterter PulseBoard-Prompt (frontend-design + Jev)
todo_prompt.md                          # Prompt des Todo-PWA-Vorversuchs
AGENTS.md                               # Artefakt-/Dokumentations-Richtlinie
HARDWARE.md                             # Referenzhardware
runtime-tests/                          # Runtime-Vorprüfungen (keine Benchmark-Runs)
scripts/                                # Hilfsskripte (z. B. Laufzeit-Analyzer)
models/
  <model-family>/                       # z. B. qwen3, gemma-4, ornith-1.5, Edge0
    <model>/
      <model>-test<N>[-<variant>]/      # nummerierter Benchmark-/Test-Slot; optionaler Config-Suffix
        ...                             # exakte Struktur, wie sie das Modell erzeugt hat
tests/
  habit-tracker/
    habit_tracker_prompt.md             # Prompt inkl. Bewertungsrubrik
    README.md                           # Anleitung für den Habit-Tracker-Benchmark
    <modellname>/                       # ein Lauf pro Modell (Habit-Tracker-Benchmark)
```

Modell-Artefakte sind zuerst nach Modellfamilie gruppiert. Der nummerierte Test-Ordner bleibt die kanonische Run-Grenze. So kann dasselbe Modell mehrere unabhängige Benchmark-Apps oder Benchmark-Fälle durchlaufen, ohne frühere Ergebnisse zu überschreiben. Ein kurzer optionaler Suffix wie `-mehr-kontext` kann für eine kontrollierte Konfigurationsvariante verwendet werden, während die Testnummer der eindeutige Slot-Bezeichner bleibt.

**Wichtig:** Der Inhalt innerhalb eines Test-Ordners bleibt exakt so erhalten, wie das Modell ihn erzeugt hat. Der Benchmark normalisiert das erzeugte Projektlayout nicht nachträglich.

Die aktuellen PulseBoard-Läufe unterscheiden sich zum Beispiel bewusst:

- Qwen3-Coder-Next hat die App direkt in `qwen3-coder-next-test1/` erzeugt.
- Qwen3-Coder-30B-A3B und Gemma 4 26B haben innerhalb ihrer `test1`-Ordner einen zusätzlichen `pulseboard/`-Projektordner angelegt.
- Gemma 4 31B IT 8-bit mit oMLX hat die App direkt in `gemma-4-31b-it-8bit-test1-omlx/` erzeugt.
- Ornith 1.5 35B A3B hat beide Läufe direkt in den Test-Slots erzeugt. `ornith-1.5-35b-a3b-mlx-test1/` sichert den unterbrochenen Lauf mit 65K Kontext; `ornith-1.5-35b-a3b-test2-mehr-kontext/` sichert den Kontrolllauf mit 131K Kontext.
- Edge0 35B A3B Preview hat die App in einem verschachtelten `pulseboard/`-Ordner erzeugt und legt die OpenCode-Session sowie das oMLX-Runtime-Log im danebenliegenden `benchmark/`-Ordner ab.

Der Ordner `models/Edge0/Edge0-35B-A3B-preview/Edge0-35B-preview-test1/` enthält nur eine einzelne Datei (`pulseboard/public/icons/icon-192.svg`) und ist keinem dokumentierten Run zugeordnet. Er bleibt aus Gründen der Benchmark-Integrität unverändert; der dokumentierte Run ist `Edge0-35B-A3B-preview-test1/`.

Sowohl direkte als auch verschachtelte Layouts sind gültige Benchmark-Artefakte, weil diese Strukturentscheidung selbst Teil der Modellausgabe ist.

Ein gescheitertes, unterbrochenes, teilweise funktionierendes oder visuell kaputtes Ergebnis ist trotzdem ein gültiges Benchmark-Artefakt und wird genau so gesichert, wie der Lauf endete. Ein erfolgreicher Build oder grüne Unit-Tests bedeuten für sich genommen kein erfolgreiches Benchmark-Ergebnis; die finale UI/PWA-Verifikation wird separat in Notion bewertet.

## Aktuelle Modell-Artefakte

- `models/Laguna/Laguna-XS-2.1-oQ8e/Laguna-XS-2.1-oQ8e-test1/`
  - oMLX / OpenCode v2 / M1 Max 64 GB / 65.536 konfigurierter Kontext / Laguna DFlash oQ8 Draft-Modell
  - kanonische Session-Spanne: `info.time.created=1790551152070` bis zum letzten `info.time.idle=1790556874110`, exakt **5.722.040 ms (1:35:22,040; 95,367333… min)**; Berliner Zeit **2026-09-28 01:19:12,070–02:54:34,110 CEST**. Enthält automatische Compaction und die finale, durch das Längenlimit begrenzte Antwort; der Export enthält einen User-Prompt und keine manuelle Fortsetzung
  - reproduzierbare Zeitextraktion: `python3 scripts/analyze_opencode_session.py models/Laguna/Laguna-XS-2.1-oQ8e/Laguna-XS-2.1-oQ8e-test1/benchmark/session01.json` ([Analyzer](./scripts/analyze_opencode_session.py)); Quell-SHA-256 `7378698913ca88df1add7ee27a6f4b5442580701d43559a1340be0acbd34613d`
  - Zeitkomponenten: Vereinigung der Assistant-Intervalle **5.577.085 ms**, Compaction-Klammer **142.724 ms** (von der Compaction-Erstellung bis zur nächsten Assistant-Erstellung; im JSON kein Abschlusszeitstempel), übrige Übergänge **2.231 ms**. Diese summieren sich zur kanonischen Spanne; die Compaction-Klammer ist keine gemessene manuelle Leerlaufzeit. Aufgezeichnete Tools belegen **33.019 ms** innerhalb der Assistant-Intervalle; es ist kein Build-/Test-/Lint-Aufruf aufgezeichnet, daher ist die separate Production-Build-Zeit nicht verfügbar
  - von der Session gemeldete Tokens: **1.413.413 Input / 52.682 Output**, Reasoning und Cache Read/Write 0, Kosten 0. Summen der exportierten Nachrichten inklusive Compaction: **1.411.911 Input / 52.454 Output**; die Abweichung von **1.502 Input / 228 Output** ist durch den Export nicht erklärt. Maximal gemeldeter Request-Input: **34.289 Tokens** bei der Compaction
  - PulseBoard wurde im manuellen Lauf als funktionierend gemeldet; Activity-CRUD, optionales Tagesziel, datumsspezifischer Erledigt-Status und versionierte localStorage-Persistenz sind im Quellcode vorhanden. Das Session-`outcome=succeeded` belegt weder einen erfolgreichen Production-Build noch die finale Anforderungsverifikation
  - synthetische oMLX-Baseline: 4K-Prompt **462,8 pp tok/s / 40,8 tg tok/s / 8,85 s TTFT / 35,0 GB Peak-RAM**; 16K-Prompt **388,1 pp tok/s / 29,7 tg tok/s / 42,2 s TTFT / 35,6 GB Peak-RAM**
  - Belege für lange Agentenläufe: bei 26.144 Prompt-Tokens beträgt die TTFT **75,98 s**; das gesicherte Log erreicht **106,09 s** während der Compaction bei 34.289 Prompt-Tokens. Das Log deckt 50 Completions von 01:32:33,934 bis 02:54:33,903 ab und ist keine vollständige Aufzeichnung der Inferenzzeit der gesamten Session
  - finales Assistant-Segment: **1.054.337 ms (17:34,337)**, **32.768 Output-Tokens**, `finish=length`; ein fehlerhafter, nicht geschlossener Tool-Call-Envelope versucht, PWA-Icons zu erzeugen, und degeneriert zu wiederholtem `AAAAAA`. Er wird als Text wiederhergestellt, ohne ausgeführten Tool-Eintrag oder geänderte Snapshot-Dateien; das oMLX-Log bestätigt den nicht geschlossenen Envelope. Im erzeugten Anwendungs-Quellcode ist keine solche Korruption vorhanden
  - PWA-Vorbehalt: `vite.config.ts` referenziert `pwa-192x192.png` und `pwa-512x512.png`, diese PNG-Assets fehlen aber in `public/`; PWA ist daher in Notion als PARTIAL vermerkt, solange die vollständige Installierbarkeit nicht verifiziert ist bzw. fehlschlägt
  - die erzeugte `README.md` blieb die Standard-Vite-README statt einer projektspezifischen Dokumentation
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
- `models/Edge0/Edge0-35B-A3B-preview/Edge0-35B-A3B-preview-test1/`
  - oMLX / OpenCode v2 / erweiterter `frontend-design`- + Jev-Benchmark-Prompt
  - langer, stabiler Lauf mit Tool-Nutzung; der OpenCode-Export verzeichnet 133.861 Input-Tokens, 70.612 Output-Tokens und 8.085.434 Cache-Read-Tokens
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
  - finaler Agenten-Report: 46 Tests bestanden, TypeScript-Check bestanden und Production-Build bestanden
  - Runtime-Belege: Prefix-/Boundary-Caching blieb oberhalb von 132K Prompt-Tokens aktiv; der beobachtete Decode-Durchsatz bei Tool-Calls im späten Log liegt grob bei 25–27 tok/s, bei einem Kontext von über 138K Prompt-Tokens
  - Hinweis zur Artefakt-Integrität: Browser-/Code-Verifikation fand trotz grüner Tests einen kritischen Integrationsfehler beim ersten Start — ohne Activities rendert `components/App.tsx` nur `EmptyState`, sodass `ActivityList` und ihr implementiertes Hinzufügen-Formular nicht erreichbar sind und die erste Activity nicht angelegt werden kann
  - Aufräum-Hinweis: die ungenutzte Vite-Starter-`src/App.tsx` bleibt im Projekt, während `src/main.tsx` die echte App korrekt aus `src/components/App.tsx` importiert
  - das visuelle Ergebnis ist funktional, aber vergleichsweise generisch/nüchtern; die detaillierte Auswertung und der Run-Status PARTIAL stehen in Notion
- `models/qwen3/qwen3-coder-next/qwen3-coder-next-test1/`
- `models/qwen3/qwen3-coder-30b-a3b/qwen3-coder-30b-a3b-test1/pulseboard/`
- `models/gemma-4/gemma-4-26b-a4b-it-qat/gemma-4-26b-a4b-it-qat-test1/pulseboard/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/gemma-4/gemma-4-31b-it-8bit-omlx/gemma-4-31b-it-8bit-test1-omlx/`
  - oMLX / M1 Max 64 GB / 131K konfigurierter Kontext
  - erweiterter `frontend-design`- + Jev-Prompt
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
  - Runtime-Hinweise: Wiederherstellung des langen Laufs nach einer Unterbrechung; oMLX-Memory-Guard-Druck bei ca. 32K Live-Kontext; das vorgesehene TurboQuant KV8 war nicht aktiv (`turboquant_kv_bits=None`); die Stromversorgung wurde während des Laufs von einem unzureichenden 45-W-Netzteil auf das Apple-96-W-Netzteil gewechselt
  - Hinweis zur Artefakt-Integrität: der finale Quellcode/Build bleibt erhalten, obwohl die Browser-Verifikation fehlendes wirksames Styling zeigte und die erzeugten PNG-PWA-Icon-Platzhalter Dateien mit null Bytes sind
- `models/qwen3/qwen3.8-27b/qwen3.8-27b-test1/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/qwen3/qwen3.8-27b-ollama/qwen3.8-27b-ollama-test1/`
  - Todo-PWA-Vorversuch (`todo_prompt.md`) / Ollama / OpenCode v2 / 262.144 konfigurierter Kontext
  - abgebrochen nach wiederholten HTTP-200-Decode-Fehlern zwischen OpenCode und Ollama; `app.css` und PWA-Assets fehlen im Endstand, Build und Funktionstests wurden nicht mehr erreicht (in Notion als INFRA bewertet)
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/qwen3/qwen3.8-27b-oq4e-mtp-optimized/qwen3.8-27b-oq4e-mtp-optimized-test1/`
  - oMLX / OpenCode v2 / optimiertes Qwen3.8-27B-oQ4e-mtp / Agenten-Lauf mit hohem Aufwand (high effort)
  - finales OpenCode-Session-Ergebnis: **succeeded**; die kanonische Session-Spanne von `time.created` bis zum letzten `time.idle` beträgt **748,90 min (12:28:54 h)** inklusive der Pausen zwischen manuellen Fortsetzungen; das von OpenCode gemeldete finale Build-Segment von **3 h 4 min** wird nicht als kanonische Gesamtlaufzeit verwendet
  - Session-Summen: **164.023 Input**, **141.655 Output**, **13.928.491 Cache-Read-Tokens**, Kosten 0
  - finale Gates: **47/47 Vitest/RTL-Tests**, ESLint **0 Fehler / 0 Warnungen**, striktes `tsc -b` sauber, Production-Build erfolgreich
  - PWA über Unit-Tests hinaus mit einem eigenen Headless-Chrome/CDP-Harness verifiziert: Service Worker aktiv, **9/9 eindeutige Precache-Assets**, echte Dialog-Interaktion, Ziel-Zähler und 50 % Fortschritt, versionierte localStorage-Persistenz über einen Reload hinweg; nach dem Stoppen des Preview-Servers lud dasselbe Profil die App-Shell und die persistierten Daten offline erfolgreich
  - die Implementierung ist weitgehend produktionsnah: komponentisierte React/TypeScript-UI, Reducer-/Context-State, Tagesauswahl über URL-Hash, defensive versionierte localStorage-Bereinigung/-Wiederherstellung, Schutz vor Zukunftstagen in UI und Reducer, PWA-Update-Flow, Tastatur-/A11y-Behandlung, Reduced-Motion-Unterstützung und projektlokale AGENTS/PLAN/STATUS-Dokumentation
  - bemerkenswerte Design-Idee: die EKG-artige **PulseLine** füllt sich entsprechend dem täglichen Erledigungsgrad und gibt der sonst zurückhaltenden UI ein produktspezifisches visuelles Motiv
  - Jev wurde für **7 Architektur-/Produkt-Entscheidungen** genutzt; das Modell folgte dem Vorschlag mit niedriger Confidence für IndexedDB nicht blind, sondern wählte localStorage aufgrund der Risiko-/Komplexitätsabwägung der Aufgabe
  - agentische Schwäche: die Konvergenz war extrem langsam und erforderte manuelle Fortsetzungs-Prompts; viel Zeit ging in das Debuggen von Tests und anschließend in den Bau eines eigenen PWA-/Offline-Verifikations-Harness. Die finale Qualität ist stark, aber die praktische Time-to-Result schlecht
  - Anforderungsinterpretation: Dark Mode ist über `prefers-color-scheme` umgesetzt und hat bewusst **keinen manuellen/persistenten Theme-Toggle**. Das ist für den tatsächlichen Run-Prompt akzeptabel, der nur „Dark Mode berücksichtigen“ sagt; es wäre nur gegenüber älteren PulseBoard-Prompt-Varianten ein Versäumnis, die einen persistenten Toggle ausdrücklich verlangten
  - die finale Projektdokumentation ist vollständig (`AGENTS.md`, `PLAN.md`, `STATUS.md`); `STATUS.md` verzeichnet alle Meilensteine M0–M5 und die finale Browser-/Offline-Verifikation
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
- `models/qwen3/Qwen3.8-27B-TURBO-Fable-Cold-Heretic/Qwen3.8-27B-TURBO-Fable-Cold-Heretic-test1/`
  - oMLX / M1 Max 64 GB / Lightning MTP
  - erweiterter `frontend-design`- + Jev-Prompt
  - unterbrochener Lauf-Stand als Benchmark-Beleg gesichert
  - `benchmark/omlx-log.txt`
- `models/qwen3/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-test1/`
  - oMLX / M1 Max 64 GB / 134144 konfigurierter Kontext / Lightning MTP / TurboQuant KV 4-bit
  - erweiterter `frontend-design`- + Jev-Prompt; Jev als Projekt-Skill installiert und erfolgreich aufgerufen
  - unterbrochener Agenten-Lauf: drei manuelle Fortsetzungen mit `Führe die Aufgabe fort.` waren nötig, und das Modell blieb wiederholt stehen, nachdem es den nächsten Implementierungsschritt angekündigt hatte
  - im gesicherten Endstand wurde keine PulseBoard-Implementierung erzeugt; Build, Tests, Lint und PWA bleiben daher unverifiziert
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/ornith-1.5/ornith-1.5-35b-a3b/ornith-1.5-35b-a3b-mlx-test1/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/ornith-1.5/ornith-1.5-35b-a3b/ornith-1.5-35b-a3b-test2-mehr-kontext/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/qwen3/qwen3.8-35b-a3b-distill-oq8-mtp/qwen3.8-35b-a3b-distill-oq8-mtp-test1/`
  - oMLX / M1 Max 64 GB / 131K Kontext / Lightning MTP / TurboQuant KV 8-bit
  - erweiterter `frontend-design`- + Jev-Prompt
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - oMLX-Runtime-Log in `benchmark/`

Run-Urteile und detaillierte Auswertungen werden hier bewusst **nicht dupliziert**. Stattdessen siehe die Notion-Datenbank **Benchmark Runs**.

## Benchmark-Integrität

- Einen abgeschlossenen Lauf nicht reparieren, nur damit das Ergebnis besteht.
- Kaputte oder unvollständige Endstände als Beleg erhalten.
- Vom Modell erzeugte Dateien nicht verschieben oder normalisieren, nur um Layouts anzugleichen.
- Rohe Session-Exporte und reproduzierbare Fehlerbelege in Git behalten.
- Erzählende Auswertung, Vergleiche und Lessons Learned in Notion behalten.
- Die finale Browser-/UI-Verifikation getrennt vom Compile-/Build-Erfolg betrachten; visuell kaputtes Styling, leere erzeugte Assets, unvollständiges Laufzeitverhalten oder blockierte Erststart-Abläufe bleiben Benchmark-Befunde, auch wenn `npm run build` und automatisierte Tests erfolgreich beendet werden.
