# Architecture

## Stack

The repository has no single application stack. Each benchmark run contains the stack produced from its fixed prompt. Harness tooling is primarily Bash, Node.js, npm/npx, and Playwright.

## Project Structure

- `models/`: PulseBoard and earlier model run artifacts.
- `tests/habit-tracker/`: Habit Tracker prompt, launchers, verifier, and one folder per model run.
- `runtime-tests/`: runtime checks outside benchmark runs.
- `scripts/`: inspection and analysis utilities.

## State Management

State belongs to each generated application inside its model folder. The benchmark harness does not provide a shared application state manager.

## Routing / Navigation

Routing is determined by each generated application. Repository-level navigation follows the documented model and project directory conventions.

## Data Layer

Generated applications may use their own APIs, IndexedDB, local storage, or other persistence. The repository stores only reproducible artifacts; Notion is the human-readable project data source.

## Persistence

- Git preserves model outputs, prompts, locks, raw logs, and source configuration.
- Notion stores benchmark evaluations and methodology.
- Skill files and `skills-lock.json` are copied into run folders to preserve run-time state.

## Error Handling

Benchmark launchers constrain writes with sandboxing. Failed and aborted runs remain valid artifacts. Evaluation distinguishes infrastructure failures from model/agent failures.

## Testing

Each prompt defines its own build and verification requirements. `tests/habit-tracker/tools/verify/verify.mjs` provides the Playwright smoke test used by the verification prompt variant.

## Build / Deployment Notes

There is no repository-wide build. Build commands run inside generated application folders. Keep the run artifact in place and follow its own package configuration.
