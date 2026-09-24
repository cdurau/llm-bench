# AGENTS.md — llm-bench

## Purpose

This repository is the reproducible artifact store for local coding-LLM benchmarks.

The project has two sources of truth:

- **GitHub:** code, benchmark prompts, generated project states, raw session exports/logs, configs, and other reproducible technical artifacts.
- **Notion:** human-readable project documentation, benchmark evaluations, findings, comparisons, decisions, and methodology notes.

Do not duplicate narrative benchmark documentation in Git.

## Canonical locations

### GitHub

Repository: https://github.com/cdurau/llm-bench

- `instructions.md` — canonical PulseBoard benchmark prompt.
- `models/<model>/...` — generated code and run artifacts.
- Session exports (`.json`, `.md`) and raw logs stay in Git when available.
- A failed or aborted model output is still a valid benchmark artifact and must be preserved.

### Notion

Project page:
https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f

Benchmark database:
https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86

Benchmark data source:
`collection://0694e9e4-5ccd-44c6-9846-ff50a353e4c3`

Methodology:
https://app.notion.com/p/3e58253ebb2481c5b3a5e88723c25c3e

## Documentation policy

### Put in Notion

- benchmark result / verdict
- requirement-by-requirement evaluation
- model strengths and weaknesses
- agent/tool behavior
- runtime/compaction observations
- comparisons between models
- lessons learned
- benchmark-methodology changes
- decisions and follow-up ideas

### Keep in GitHub

- source code
- generated model output
- benchmark prompts
- package/config files
- tests created by the model
- raw session exports
- raw logs or reproducible failure evidence
- scripts used to run or inspect benchmarks
- this `AGENTS.md`

Do **not** create new `RESULT.md`, `NOTES.md`, or equivalent narrative evaluation files under model folders. Their canonical home is Notion.

## After every benchmark run

When a model run is finished or intentionally aborted:

1. Preserve the model's final generated state exactly as it ended.
2. Do not silently repair a failed benchmark after the run has been closed.
3. Save useful raw session/log artifacts in the corresponding Git model folder when available.
4. Commit/push the technical artifacts to Git.
5. Create or update the matching entry in the Notion **Benchmark Runs** database.
6. Populate at least:
   - Run
   - Modell
   - Datum
   - Status
   - Runtime
   - Agent
   - Kontext Tokens when known
   - Build
   - Tests
   - Lint
   - PWA
   - Agent Stabilität
   - GitHub
   - Git Pfad
   - Kurzfazit
7. Put the detailed evaluation in the Notion database page body.
8. Link the Notion evaluation back to the exact Git model/run folder.
9. If the methodology changed, update the Notion methodology page rather than creating a new Git narrative document.

## Status meanings

- **PASS** — benchmark requirements completed and actually verified.
- **PARTIAL** — meaningful implementation exists, but important requirements are missing or unverified.
- **FAIL** — core requirements failed, the run was aborted, or the final state is not usable/buildable.
- **INFRA** — infrastructure/runtime prevented a fair model result. Use only when model behavior cannot be meaningfully evaluated.

Runtime errors and model errors should be separated in the evaluation whenever possible.

## Benchmark integrity

- Never improve an already closed model result just to make it look better.
- Keep broken code if that broken code is the authentic final output.
- Distinguish infrastructure/tool-protocol failures from agent reasoning/coding failures.
- Repeated bad edits, failure to change strategy, task drift, and inability to verify the final product are relevant agentic benchmark findings.
- Do not change `instructions.md` between comparison runs unless the benchmark methodology is intentionally versioned and documented in Notion.

## Notion access

Use the Notion connector/MCP to maintain the project documentation.

If Notion access is unavailable:

- do not create a duplicate evaluation document in Git as a substitute;
- preserve the raw Git artifacts;
- clearly report that the Notion documentation update is pending because the connector is unavailable.

## Before finishing work

For benchmark-related changes, verify:

- technical artifacts are committed to the correct model folder;
- no accidental post-run repair changed a closed benchmark result;
- Notion contains the current readable evaluation;
- Git does not contain a competing narrative evaluation;
- Git and Notion link to one another where useful.
