# llm-bench

Reproducible artifact repository for local coding-LLM benchmarks.

## Source of truth

This project intentionally separates technical artifacts from human-readable evaluation:

- **GitHub** stores benchmark prompts, generated code, configs, raw session exports/logs, and other reproducible artifacts.
- **Notion** stores run evaluations, comparisons, findings, decisions, and benchmark methodology.

Notion project: https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f  
Benchmark Runs: https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86  
Methodology: https://app.notion.com/p/3e58253ebb2481c5b3a5e88723c25c3e

## PulseBoard benchmark

The original canonical reproducible prompt is [`instructions.md`](./instructions.md).

Runs using the extended agent workflow with `frontend-design`, Jev and project-memory documentation use [`instructions_jev_frontend-skill.md`](./instructions_jev_frontend-skill.md). These runs are not directly comparable with runs using the original prompt.

Agent/documentation rules are defined in [`AGENTS.md`](./AGENTS.md).

## Repository layout

```text
instructions.md                         # canonical benchmark prompt
AGENTS.md                               # artifact/documentation policy
models/
  <model-family>/                       # e.g. qwen3, gemma-4, ornith-1.5
    <model>/
      <model>-test<N>[-<variant>]/      # numbered benchmark/test slot; optional config suffix
        ...                             # exact structure produced by the model
```

Model artifacts are grouped by model family first. The numbered test folder remains the canonical run boundary. It lets the same model run multiple independent benchmark apps or benchmark cases without overwriting earlier results. A short optional suffix such as `-mehr-kontext` may be used for a controlled configuration variant, while the test number remains the unique slot identifier.

**Important:** the contents inside a test folder are preserved exactly as the model created them. The benchmark does not normalize the generated project layout afterward.

For example, the current PulseBoard runs differ intentionally:

- Qwen3-Coder-Next created the app directly inside `qwen3-coder-next-test1/`.
- Qwen3-Coder-30B-A3B and Gemma 4 created an additional `pulseboard/` project folder inside their `test1` folders.
- Ornith 1.5 35B A3B created both runs directly in their test slots. `ornith-1.5-35b-a3b-mlx-test1/` preserves the interrupted 65K-context run; `ornith-1.5-35b-a3b-test2-mehr-kontext/` preserves the 131K-context control run.

Both direct and nested layouts are valid benchmark artifacts because this structural choice is itself part of the model output.

A failed or interrupted result is still a valid benchmark artifact and is preserved exactly as the run ended.

## Current model artifacts

- `models/qwen3/qwen3-coder-next/qwen3-coder-next-test1/`
- `models/qwen3/qwen3-coder-30b-a3b/qwen3-coder-30b-a3b-test1/pulseboard/`
- `models/gemma-4/gemma-4-26b-a4b-it-qat/gemma-4-26b-a4b-it-qat-test1/pulseboard/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`
- `models/qwen3/qwen3.8-27b/qwen3.8-27b-test1/`
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
