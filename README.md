# llm-bench

Reproducible artifact repository for local coding-LLM benchmarks.

## Source of truth

This project intentionally separates technical artifacts from human-readable evaluation:

- **GitHub** stores benchmark prompts, generated code, configs, raw session exports/logs, and other reproducible artifacts.
- **Notion** stores run evaluations, comparisons, findings, decisions, and benchmark methodology.

Notion project: https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f  
Benchmark Runs: https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86  
Methodology: https://app.notion.com/p/3e58253ebb2481c5b3a5e88723c25c3e

## Runtime and model-format strategy

As of 2026-09-27, the benchmark is intentionally focused on the practical target: reliable local coding agents on Apple Silicon that can build medium-to-complex applications with minimal manual intervention.

- **Primary path: oMLX + MLX.** This is the default for serious new coding benchmark runs and the current reference platform.
- **Comparison path: Ollama + MLX.** Selected strong models may be tested against oMLX under controlled conditions, especially for tool calling, TTFT, decode speed, memory use and agent stability.
- **Model lab / fallback: LM Studio + MLX/GGUF.** LM Studio remains useful for quickly loading and inspecting new models and for compatibility checks, but is no longer the primary benchmark runtime.
- **GGUF is a targeted secondary path.** Use it when an interesting model/finetune is not reasonably available as MLX or when GGUF offers a concrete advantage. The project does not aim for a 50:50 MLX/GGUF split.
- As a rough guideline, **80–90% of relevant model exploration should use MLX**. Do not test every quantization across every runtime unless the comparison answers a concrete question.
- Prioritize promising **27–40B dense/MoE** models and larger **50–70B MoE or strongly quantized models** when they leave enough memory headroom for the runtime, KV cache and coding agent.
- **100–120B experiments are selective**, not a default search path. The Nemotron 120B loading/inference experiments are an example where runtime complexity and memory pressure can outweigh the practical benefit.
- For a particularly strong candidate, a controlled **oMLX vs Ollama-MLX** follow-up can compare the same model using TTFT, decode speed, RAM, tool-call success, agent stability and the final PulseBoard result.

The current practical reference is **Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp + oMLX**. New candidates are judged primarily on the combined result of quality, speed, memory footprint and agentic reliability rather than raw tokens/s alone. Detailed runtime rationale and evolving findings remain in the Notion **Inference Provider & Runtime Vergleich** page.

## PulseBoard benchmark

The original canonical reproducible prompt is [`instructions.md`](./instructions.md).

Runs using the extended agent workflow with `frontend-design`, Jev and project-memory documentation use [`instructions_jev_frontend-skill.md`](./instructions_jev_frontend-skill.md). These runs are not directly comparable with runs using the original prompt.

Agent/documentation rules are defined in [`AGENTS.md`](./AGENTS.md).

### Runtime measurement

Benchmark completion time is **derived from the preserved OpenCode/session logs**, not estimated manually from chat messages or wall-clock recollection.

- Prefer the timestamps in `benchmark/session01.json` (or the corresponding raw session export) as the canonical source.
- For a completed run, calculate elapsed agent runtime from the session start/creation timestamp through the final completed/idle timestamp recorded by the session.
- For an interrupted or failed run, calculate the elapsed time only through the recorded interruption/abort point and label it explicitly as **time until abort/failure**, not completion time.
- Manual continuation prompts remain part of the same run. Their delays should be interpreted from the session timeline rather than guessed.
- Runtime values copied into Notion should therefore be reproducible from the GitHub artifacts. When a raw session log is available, prefer this extracted value over manually reported durations.
- Keep runtime distinct from inference metrics such as TTFT, prompt-processing speed and decode tok/s. The benchmark uses both: inference metrics describe model/runtime speed, while elapsed session time measures practical **time-to-result** for the coding-agent task.

For future benchmark evaluations, runtime extraction from the logs is a standard evaluation step alongside build/tests, functional verification, tool-use stability and UI/PWA inspection.

## Repository layout

```text
instructions.md                         # canonical benchmark prompt
AGENTS.md                               # artifact/documentation policy
models/
  <model-family>/                       # e.g. qwen3, gemma-4, ornith-1.5, Edge0
    <model>/
      <model>-test<N>[-<variant>]/      # numbered benchmark/test slot; optional config suffix
        ...                             # exact structure produced by the model
```

Model artifacts are grouped by model family first. The numbered test folder remains the canonical run boundary. It lets the same model run multiple independent benchmark apps or benchmark cases without overwriting earlier results. A short optional suffix such as `-mehr-kontext` may be used for a controlled configuration variant, while the test number remains the unique slot identifier.

**Important:** the contents inside a test folder are preserved exactly as the model created them. The benchmark does not normalize the generated project layout afterward.

For example, the current PulseBoard runs differ intentionally:

- Qwen3-Coder-Next created the app directly inside `qwen3-coder-next-test1/`.
- Qwen3-Coder-30B-A3B and Gemma 4 26B created an additional `pulseboard/` project folder inside their `test1` folders.
- Gemma 4 31B IT 8-bit with oMLX created the app directly inside `gemma-4-31b-it-8bit-test1-omlx/`.
- Ornith 1.5 35B A3B created both runs directly in their test slots. `ornith-1.5-35b-a3b-mlx-test1/` preserves the interrupted 65K-context run; `ornith-1.5-35b-a3b-test2-mehr-kontext/` preserves the 131K-context control run.
- Edge0 35B A3B Preview created the app in a nested `pulseboard/` folder and stores the OpenCode session plus oMLX runtime log in the sibling `benchmark/` folder.

Both direct and nested layouts are valid benchmark artifacts because this structural choice is itself part of the model output.

A failed, interrupted, partially working, or visually broken result is still a valid benchmark artifact and is preserved exactly as the run ended. A successful build or green unit tests do not by themselves imply a successful benchmark result; final UI/PWA verification is evaluated separately in Notion.

## Current model artifacts

- `models/Edge0/Edge0-35B-A3B-preview/Edge0-35B-A3B-preview-test1/`
  - oMLX / OpenCode v2 / extended `frontend-design` + Jev benchmark prompt
  - long, stable tool-using run; OpenCode export records 133,861 input tokens, 70,612 output tokens and 8,085,434 cache-read tokens
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
  - final agent report: 46 tests passed, TypeScript check passed and production build passed
  - runtime evidence: prefix/boundary caching remained active above 132K prompt tokens; observed tool-call decode throughput in the late-run log is roughly 25–27 tok/s, with context growing beyond 138K prompt tokens
  - artifact integrity note: browser/code verification found a critical fresh-start integration bug despite green tests — with zero activities, `components/App.tsx` renders only `EmptyState`, so `ActivityList` and its implemented add form are unreachable and the first activity cannot be created
  - cleanup note: unused Vite starter `src/App.tsx` remains in the project, while `src/main.tsx` correctly imports the real app from `src/components/App.tsx`
  - visual result is functional but comparatively generic/utilitarian; detailed evaluation and PARTIAL run status are recorded in Notion
- `models/qwen3/qwen3-coder-next/qwen3-coder-next-test1/`
- `models/qwen3/qwen3-coder-30b-a3b/qwen3-coder-30b-a3b-test1/pulseboard/`
- `models/gemma-4/gemma-4-26b-a4b-it-qat/gemma-4-26b-a4b-it-qat-test1/pulseboard/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/gemma-4/gemma-4-31b-it-8bit-omlx/gemma-4-31b-it-8bit-test1-omlx/`
  - oMLX / M1 Max 64 GB / 131K configured context
  - extended `frontend-design` + Jev prompt
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
  - runtime notes: long-run recovery after interruption; oMLX memory-guard pressure around ~32K live context; intended TurboQuant KV8 was not active (`turboquant_kv_bits=None`); power delivery changed from an insufficient 45 W supply to the Apple 96 W adapter during the run
  - artifact integrity note: final source/build is preserved even though browser verification showed missing effective styling and the generated PNG PWA icon placeholders are zero-byte files
- `models/qwen3/qwen3.8-27b/qwen3.8-27b-test1/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/qwen3/qwen3.8-27b-oq4e-mtp-optimized/qwen3.8-27b-oq4e-mtp-optimized-test1/`
  - oMLX / OpenCode v2 / optimized oQ4e + MTP run
  - interrupted after **364.19 min (6:04:12 h)**; canonical duration extracted from `benchmark/session01.json`, therefore this is time-to-abort rather than time-to-success
  - final documented test state: **39/47 tests passed (~83%)**, with 8 App integration tests still failing
  - project state is nevertheless far advanced: React/TypeScript app, componentized UI, reducer/context state, versioned localStorage persistence, date navigation, activity CRUD, daily targets/progress, corruption handling, dashboard/category statistics, tests, PWA setup and substantial custom CSS are present
  - benchmark interpretation: failure is primarily an **agentic completion/debug-convergence problem**, not an early inability to implement PulseBoard; extremely long reasoning/debug phases prevented a clean finish
  - requirement miss: `PLAN.md` deliberately selects OS-driven `prefers-color-scheme` dark mode with **no manual toggle**, while the PulseBoard requirement calls for a persistent Dark/Light toggle
  - documentation incompleteness: `PLAN.md` references `STATUS.md`, but no `STATUS.md` is present in the preserved final run
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - `benchmark/omlx-log.txt`
- `models/qwen3/Qwen3.8-27B-TURBO-Fable-Cold-Heretic/Qwen3.8-27B-TURBO-Fable-Cold-Heretic-test1/`
  - oMLX / M1 Max 64 GB / Lightning MTP
  - extended `frontend-design` + Jev prompt
  - interrupted run state preserved as benchmark evidence
  - `benchmark/omlx-log.txt`
- `models/qwen3/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-NEO-CODER-test1/`
  - oMLX / M1 Max 64 GB / 134144 configured context / Lightning MTP / TurboQuant KV 4-bit
  - extended `frontend-design` + Jev prompt; Jev installed as project skill and successfully invoked
  - interrupted agent run: three manual `Führe die Aufgabe fort.` continuations were required and the model repeatedly stopped after announcing the next implementation step
  - no PulseBoard implementation was produced in the preserved final state; build, tests, lint and PWA therefore remain unverified
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/ornith-1.5/ornith-1.5-35b-a3b/ornith-1.5-35b-a3b-mlx-test1/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/ornith-1.5/ornith-1.5-35b-a3b/ornith-1.5-35b-a3b-test2-mehr-kontext/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/qwen3/qwen3.8-35b-a3b-distill-oq8-mtp/qwen3.8-35b-a3b-distill-oq8-mtp-test1/`
  - oMLX / M1 Max 64 GB / 131K context / Lightning MTP / TurboQuant KV 8-bit
  - extended `frontend-design` + Jev prompt
  - `benchmark/session01.json`
  - `benchmark/session01.md`
  - oMLX runtime log in `benchmark/`

Run verdicts and detailed evaluations are intentionally **not duplicated here**. See the Notion **Benchmark Runs** database instead.

## Benchmark integrity

- Do not repair a closed run just to make the result pass.
- Preserve broken or incomplete final states as evidence.
- Do not move or normalize files created by the model merely to make layouts consistent.
- Keep raw session exports and reproducible failure evidence in Git.
- Keep narrative evaluation, comparisons, and lessons learned in Notion.
- Treat final browser/UI verification as distinct from compile/build success; visually broken styling, empty generated assets, incomplete runtime behavior, or blocked first-run flows remain benchmark findings even when `npm run build` and automated tests exit successfully.
