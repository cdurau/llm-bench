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

The canonical reproducible prompt is [`instructions.md`](./instructions.md).

Agent/documentation rules are defined in [`AGENTS.md`](./AGENTS.md).

## Repository layout

```text
instructions.md                 # canonical benchmark prompt
AGENTS.md                       # artifact/documentation policy
models/
  <model>/
    ...                         # exact generated project state
    benchmark/
      session*.json             # raw OpenCode session export
      session*.md               # readable OpenCode session export
```

A failed or interrupted result is still a valid benchmark artifact and is preserved exactly as the run ended.

## Current model artifacts

- `models/qwen3-coder-next/qwen3-coder-next-test1/`
- `models/qwen3-coder-30b-a3b/pulseboard/`
- `models/gemma-4-26b-a4b-it-qat/pulseboard/`
  - `benchmark/session01.json`
  - `benchmark/session01.md`

Run verdicts and detailed evaluations are intentionally **not duplicated here**. See the Notion **Benchmark Runs** database instead.

## Benchmark integrity

- Do not repair a closed run just to make the result pass.
- Preserve broken or incomplete final states as evidence.
- Keep raw session exports and reproducible failure evidence in Git.
- Keep narrative evaluation, comparisons, and lessons learned in Notion.
