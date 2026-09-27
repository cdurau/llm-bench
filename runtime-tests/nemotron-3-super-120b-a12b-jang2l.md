# Nemotron 3 Super 120B-A12B UNCENSORED JANG_2L — Runtime-Vorprüfung

Datum: 2026-09-27  
Hardware: MacBook Pro M1 Max, 64 GB Unified Memory  
Modell: `Nemotron-3-Super-120B-A12B-UNCENSORED-JANG_2L`  
Lokaler Modellpfad beim Test: `~/.lmstudio/models/dealignai/Nemotron-3-Super-120B-A12B-UNCENSORED-JANG_2L`

## Ziel

Vorprüfung, ob das Modell als unkomplizierte lokale Runtime für OpenCode/PulseBoard geeignet ist: in 64 GB passend, ausreichend schnell und ohne größeren Sonderaufwand über den bestehenden Stack nutzbar.

## Loader-Kompatibilität

Der direkte Ladeversuch über den normalen MLX-LM/oMLX-Pfad scheiterte mit:

```text
ValueError: Unable to quantize model of type <class 'mlx_lm.models.nemotron_h.MoEGate'>
```

Eine isolierte Python-Umgebung mit JANG 2.5.48 wurde eingerichtet. `jang_tools.loader.load_jang_model()` traf zunächst denselben `MoEGate`-Fehler.

Als Workaround wurde ausschließlich in der isolierten JANG-venv `MoEGate.to_quantized()` als No-op ergänzt. Danach ließ sich das Modell über `load_jang_model()` erfolgreich laden.

Beobachtete Ladezeiten: 12.8–15.7 s.

## Direkte MLX-LM-Generation nach JANG-Load

| Test | Prompt | Generation | Decode | Peak Memory |
|---|---:|---:|---:|---:|
| Apple Silicon #1 | 30 Tokens | 64 Tokens | 22.228 tok/s | 45.780 GB |
| Apple Silicon #2 | 30 Tokens | 64 Tokens | 22.209 tok/s | 45.946 GB |
| TypeScript `groupBy` | 42 Tokens | 477 Tokens | 20.990 tok/s | 46.085 GB |

Prompt Processing in diesen kleinen Tests: ca. 3.826–6.610 tok/s.

Der längere 477-Token-Test bestätigt, dass der Decode-Durchsatz von ungefähr 21 tok/s nicht nur ein kurzer Ausreißer war.

## Thinking / Reasoning

Bei direkter `mlx_lm.generate()`-Nutzung wurde das Reasoning ungefiltert im normalen Text ausgegeben. Bei `max_tokens=64` konnte dadurch die eigentliche Antwort abgeschnitten werden.

JANGs CLI unterstützt `--no-thinking`. Der Test funktionierte korrekt und lieferte nur die finale Antwort.

CLI-Messungen:

- `jang inference`, Thinking aktiv: 64 Tokens, 6.750 tok/s, Load 13.76 s.
- `jang inference --no-thinking`: 50 Tokens, 4.786 tok/s, Load 14.01 s.

Diese kurzen CLI-Werte sind nicht direkt mit der direkten `mlx_lm.generate()`-Messung gleichzusetzen und werden nicht als Modellqualitätsbenchmark gewertet.

## Server-Test

`mlx_lm.server` ließ sich auf `127.0.0.1:8080` starten und nahm einen POST auf `/v1/chat/completions` entgegen. Im Test wurde das JANG-Modell über diesen Pfad jedoch nicht sichtbar in den Speicher geladen; der Rechner blieb bei ungefähr 10 GB belegtem RAM, während der direkte funktionierende JANG-Load rund 46 GB MLX Peak Memory zeigte.

Damit stand kein unkomplizierter OpenAI-kompatibler Pfad für OpenCode zur Verfügung.

## Entscheidung

**Nicht als PulseBoard-Agentenbenchmark fortführen.**

Das Modell ist technisch interessant: Ein 120B-Modell mit etwa 12B aktiven Parametern passt in 64 GB und erreicht nach erfolgreichem JANG-Load ungefähr 21–22 tok/s Decode bei rund 46 GB Peak Memory. Für das aktuelle Ziel ist die Runtime aber zu aufwendig: zusätzlicher JANG-Pfad, manueller `MoEGate`-Patch, Reasoning-Sonderbehandlung und kein direkt funktionierender OpenAI-Serverpfad.

Gesucht werden stattdessen Modelle, die sich direkt über den bestehenden oMLX/OpenCode-Stack laden lassen, genügend Speicher-Headroom für längere Agentenläufe besitzen und mittlere bis komplexe Apps ohne Runtime-Sonderbau bearbeiten können.

Dies ist eine Runtime-Vorprüfung, kein vollständiger PulseBoard-Modellbenchmark.
