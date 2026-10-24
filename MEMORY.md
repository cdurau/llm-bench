# Project Memory

## Purpose

This repository is the reproducible artifact store for local coding-LLM benchmarks. GitHub holds technical artifacts and prompts; Notion holds evaluations, comparisons, and methodology narratives.

## Main Goals

- Preserve each model run exactly as generated.
- Compare model behavior under reproducible prompts, tools, skills, and sandboxes.
- Separate code/runtime failures from model and agent failures.

## Core Features

- PulseBoard benchmark artifacts under `models/`.
- Habit Tracker („Rhythm") benchmark under `tests/habit-tracker/`.
- Shell launchers for sandboxed OpenCode and Pi runs.
- Playwright smoke-test tooling for the Habit Tracker verification variant.

## Important Constraints

- Never repair or normalize a closed model run.
- Keep benchmark prompts stable unless a methodology change is documented in Notion.
- Do not add narrative benchmark results under model folders; evaluations belong in Notion.
- Preserve generated directory structure as benchmark evidence.

## Conventions

- PulseBoard: `models/<model-family>/<model>/<model>-test<N>[-variant]/`.
- Habit Tracker: `tests/habit-tracker/<model-name>/`.
- Raw sessions, logs, configs, and reproducible failures stay with their run artifact.

## Key Files

- `AGENTS.md`: repository governance and canonical locations.
- `instructions.md`: canonical PulseBoard prompt.
- `tests/habit-tracker/habit_tracker_prompt.md`: Habit Tracker prompt and private rubric.
- `tests/habit-tracker/auto-install-skills.sh`: configurable project-local skill installer.
- `tests/habit-tracker/run-opencode-sandbox.sh`: primary macOS sandbox launcher.

## Quick Resume

Read `CURRENT_STATE.md` and `TASKS.md`, then inspect only the benchmark or script relevant to the task. Treat generated run contents as immutable evidence once documented.
