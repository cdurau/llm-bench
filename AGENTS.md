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
- `models/<model>/<model>-test<N>/<app>/` — canonical layout for new benchmark artifacts.
- `<model>-test1`, `<model>-test2`, ... are independent numbered benchmark/test slots for that model.
- The concrete app name belongs below the numbered test folder, for example `.../test1/pulseboard/`.
- Session exports (`.json`, `.md`) and raw logs stay with the corresponding app/run artifact in Git when available.
- A failed or aborted model output is still a valid benchmark artifact and must be preserved.
- Existing closed artifacts that predate the current layout do not need to be moved merely for consistency.

The numbered test layer exists so one model can be evaluated on multiple benchmark apps or benchmark cases without overwriting or mixing prior results. Never reuse a closed test slot for a different benchmark artifact.

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
3. Store the result in the correct `models/<model>/<model>-test<N>/<app>/` slot. For a new benchmark app/case, use a new numbered test slot instead of overwriting an earlier one.
4. Save useful raw session/log artifacts with the matching app/run artifact when available.
5. Commit/push the technical artifacts to Git.
6. Create or update the matching entry in the Notion **Benchmark Runs** database.
7. Populate at least:
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
8. Put the detailed evaluation in the Notion database page body.
9. Link the Notion evaluation back to the exact Git app/run folder, not only the model root.
10. If the methodology changed, update the Notion methodology page rather than creating a new Git narrative document.

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
- Do not repurpose or overwrite a numbered test folder after it has become part of a documented benchmark run.

## Notion access

Use the Notion connector/MCP to maintain the project documentation.

If Notion access is unavailable:

- do not create a duplicate evaluation document in Git as a substitute;
- preserve the raw Git artifacts;
- clearly report that the Notion documentation update is pending because the connector is unavailable.

## Before finishing work

For benchmark-related changes, verify:

- technical artifacts are committed to the correct model/test/app folder;
- no accidental post-run repair changed a closed benchmark result;
- the matching Notion run points to the exact current Git path;
- Notion contains the current readable evaluation;
- Git does not contain a competing narrative evaluation;
- Git and Notion link to one another where useful.
