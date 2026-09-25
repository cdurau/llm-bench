# Benchmark-Auswertung — Qwen3.8 35B A3B Distill oQ8 MTP

## Ergebnis

- Gesamtstatus: **PARTIAL**
- Agent-Stabilität: **Stabil**
- Tests: **PASS — 36/36**
- TypeScript: **PASS — `tsc --noEmit`**
- Production Build: **PASS**
- PWA: **PASS**
- Lint: **Nicht geprüft** — ESLint wurde konfiguriert, `npm run lint` aber in der Session nicht tatsächlich ausgeführt.

Der Run ist insgesamt sehr stark. Die PARTIAL-Einstufung bleibt bestehen, weil das explizit geforderte Bearbeiten einer bestehenden Aktivität im finalen UI nicht erreichbar ist. Das Projekt nennt dies in `PROJECT-STATE.md` selbst als bekannte MVP-Einschränkung.

## Manueller Funktionstest

Nach dem Agentenlauf wurde die App zusätzlich im Browser geprüft. Bestätigt:

- Aktivitäten funktionieren.
- Filter funktionieren.
- Tagesstatus wird für unterschiedliche Kalendertage getrennt gespeichert und gezählt.
- Daten bleiben persistent.
- Nach einem Reload startet die Ansicht wieder beim aktuellen Tag.
- Das mobile/responsive Layout funktioniert.
- Auf Desktop wirkt das Layout stellenweise etwas zu weit auseinandergezogen; dies ist ein UI-Polish-Punkt und kein funktionaler Fehler.

## oMLX-Statistik des realen Runs

Hardware: **MacBook Pro 14" 2021 · Apple M1 Max · 64 GB Unified Memory**

Runtime: **oMLX Desktop 0.7.0rc1**, Lightning MTP an, TurboQuant KV Cache 8-bit, 131.072 Kontexttokens.

| Metrik | Wert |
| --- | ---: |
| Requests | 80 |
| Total Tokens | 3,1 Mio. |
| Prompt Tokens | 3,0 Mio. |
| Output Tokens | 70,6k |
| Cached Tokens (Usage History) | 2,9 Mio. |
| Total Prefill Tokens (Session) | 2,54 Mio. |
| Cached Prefill Tokens (Session) | 2,48 Mio. |
| Cache Efficiency | **97,4 %** |
| Prompt Processing, excl. cached | **211,9 tok/s** |
| Average Token Generation | **31,3 tok/s** |
| Geladenes Modell | 38,62 GB |

Die über 80 Requests gemessenen **31,3 tok/s** sind für den realen Coding-Agentenlauf aussagekräftiger als die vorherige Einzelmessung von ca. 42,6 tok/s Decode. Besonders auffällig ist die **97,4 % Cache Efficiency**: Der überwiegende Anteil des kumulierten Prompt-Kontexts konnte wiederverwendet werden.

Die Vorab-Einzelmessung bei ca. 9,4k Prompt-Tokens (42,6 tok/s Decode, 22,84 s TTFT, funktionierender Boundary/Prefix Cache) bleibt eine separate Runtime-Referenz und ist nicht das finale Benchmark-Performance-Ergebnis.

## Agentenbefund

Stärken: autonomer Lauf ohne Rückfragen, sinnvoller Einsatz von `frontend-design`, selektiver Jev-Einsatz, gute Fehler-Recovery, erfolgreiche Test-/TypeScript-/Build-Schleifen, funktionierende PWA und selbstständig angelegte Projektdokumentation.

Schwächen: Requirement-Tracking und finale Selbstverifikation waren nicht vollständig zuverlässig. Das fehlende UI-Bearbeiten wurde in der eigenen Projektdokumentation erkannt, in der finalen Zusammenfassung aber trotzdem als erfüllt dargestellt. Ebenso wurde Lint als erfolgreich dargestellt, obwohl kein tatsächlicher Lint-Lauf dokumentiert ist.

## Vergleichbarkeit

Dieser Run ist nicht 1:1 mit älteren PulseBoard-Runs vergleichbar. Gegenüber früheren Läufen wurden unter anderem Prompt, `frontend-design`-Skill, Jev-Regel, oMLX-Runtime, Lightning MTP, TurboQuant KV 8-bit und das 131K-Kontextfenster geändert.
