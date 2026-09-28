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
- `instructions_jev_frontend-skill.md` — extended PulseBoard prompt (`frontend-design` + Jev + project-memory documentation). Runs using it are not directly comparable with runs using the original prompt.
- `todo_prompt.md` — prompt of the earlier Todo PWA trial run (`models/qwen3/qwen3.8-27b-ollama/`); it is not a PulseBoard run.
- `tests/habit-tracker/` — Habit Tracker („Rhythm") benchmark. Contains `habit_tracker_prompt.md` (prompt plus evaluation rubric), `install-skills.sh` / `auto-install-skills.sh` (skill installers), a `README.md`, and **one folder per model** at `tests/habit-tracker/<model-name>/` (structure per project instead of per model). Do not show the rubric at the end of `habit_tracker_prompt.md` to the model under test.
- `models/<model-family>/<model>/<model>-test<N>[-<variant>]/` — canonical run boundary for PulseBoard (and earlier) benchmark artifacts; a short optional suffix may identify a controlled configuration variant.
- `<model>-test1`, `<model>-test2`, ... are independent numbered benchmark/test slots for that model. Optional suffixes such as `-mehr-kontext` do not create a second slot with the same number; the numeric test ID remains unique.
- `HARDWARE.md` — reference hardware for all runs unless a run documents otherwise.
- `runtime-tests/` — runtime pre-checks that are not benchmark runs (e.g. loading experiments).
- `scripts/` — scripts used to inspect benchmarks (e.g. `analyze_opencode_session.py` for timing extraction).
- Everything **inside** a numbered test folder must preserve the structure actually created by the model.
- If a model creates the application directly in the test folder, keep it there.
- If a model creates an additional project folder such as `pulseboard/`, keep that folder as generated.
- Session exports (`.json`, `.md`) and raw logs stay with the corresponding run artifact in Git when available.
- A failed or aborted model output is still a valid benchmark artifact and must be preserved.

The numbered test layer exists so one model can be evaluated on multiple benchmark apps or benchmark cases without overwriting or mixing prior results. Never reuse a closed test slot for a different benchmark artifact.

The generated directory structure is itself benchmark evidence. Do not reorganize, flatten, nest, rename, or otherwise normalize a closed model result merely to make different models look consistent.

### Notion

Project page:
https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f

Benchmark database:
https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86

Benchmark data source:
`collection://0694e9e4-5ccd-44c6-9846-ff50a353e4c3`

Methodology:
https://app.notion.com/p/3e58253ebb2481c5b3a5e88723c25c3e

Prompt pages (readable versions of the prompts):

- PulseBoard: https://app.notion.com/p/3e58253ebb2481559131f2672aacc765
- Habit Tracker: https://app.notion.com/p/3e98253ebb248154bfc2ed1a92e13f2d

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
3. Store the result under the correct slot: `models/<model-family>/<model>/<model>-test<N>[-<variant>]/` for PulseBoard and earlier benchmarks, or `tests/<project>/<model-name>/` for the Habit Tracker and later per-project benchmarks.
4. Preserve the model-created structure inside that slot exactly; an extra app folder is neither required nor forbidden.
5. For a new benchmark app/case or controlled rerun, use a new numbered test slot instead of overwriting an earlier one; an optional suffix may describe the configuration variant.
6. Save useful raw session/log artifacts with the matching run artifact when available.
7. Commit/push the technical artifacts to Git.
8. Create or update the matching entry in the Notion **Benchmark Runs** database.
9. Populate at least:
   - Run
   - Benchmark-Projekt (PulseBoard, Todo-PWA, Habit-Tracker)
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
10. Put the detailed evaluation in the Notion database page body.
11. Link the Notion evaluation back to the exact Git location of the generated run artifact.
12. If the methodology changed, update the Notion methodology page rather than creating a new Git narrative document.

## Status meanings

- **PASS** — benchmark requirements completed and actually verified.
- **PARTIAL** — meaningful implementation exists, but important requirements are missing or unverified.
- **FAIL** — core requirements failed, the run was aborted, or the final state is not usable/buildable.
- **INFRA** — infrastructure/runtime prevented a fair model result. Use only when model behavior cannot be meaningfully evaluated.

Runtime errors and model errors should be separated in the evaluation whenever possible.

## Benchmark integrity

- Never improve an already closed model result just to make it look better.
- Keep broken code if that broken code is the authentic final output.
- Keep model-created folder/layout decisions intact as part of the artifact.
- Distinguish infrastructure/tool-protocol failures from agent reasoning/coding failures.
- Repeated bad edits, failure to change strategy, task drift, and inability to verify the final product are relevant agentic benchmark findings.
- Do not change `instructions.md` (or `tests/habit-tracker/habit_tracker_prompt.md` for the Habit Tracker) between comparison runs unless the benchmark methodology is intentionally versioned and documented in Notion.
- Do not repurpose or overwrite a numbered test folder after it has become part of a documented benchmark run.

## Notion access

Use the Notion connector/MCP to maintain the project documentation.

If Notion access is unavailable:

- do not create a duplicate evaluation document in Git as a substitute;
- preserve the raw Git artifacts;
- clearly report that the Notion documentation update is pending because the connector is unavailable.

## Before finishing work

For benchmark-related changes, verify:

- technical artifacts are committed to the correct model/test folder (`models/...` or `tests/<project>/<model-name>/`);
- the model-created internal folder structure remains unchanged;
- no accidental post-run repair changed a closed benchmark result;
- the matching Notion run points to the exact current Git path;
- Notion contains the current readable evaluation;
- Git does not contain a competing narrative evaluation;
- Git and Notion link to one another where useful.
