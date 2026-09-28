# Habit Tracker benchmark ("Rhythm")

Second benchmark task of the llm-bench project, after PulseBoard. A local coding LLM builds a small, offline-capable habit and mood tracker as a PWA from a fixed prompt. The focus is on **design quality** and on how well the agent uses skills, in particular the optional [Jev](https://www.skills.sh/okooo5km/jev/jev) decision skill.

Layout: one folder per model directly under this directory (`tests/habit-tracker/<model-name>/`), not the `models/<family>/<model>/<model>-test<N>/` structure used for PulseBoard.

## Task in short

- App: **Rhythm**, habits with streaks, daily mood (1 to 5), week chart, dark mode, offline use.
- Fixed stack: Vite, React, TypeScript, `vite-plugin-pwa`, Tailwind CSS v4, IndexedDB via `idb`, Recharts.
- Skills: `minimalist-ui` (design), `vite-pwa-patterns` (PWA setup) and, in Jev runs, `jev` (fast typed decisions via CLI).
- Done when `npm run build` passes and `npm run preview` shows the app.

The full task is in [`habit_tracker_prompt.md`](./habit_tracker_prompt.md).

## Files

| File | Purpose |
| --- | --- |
| `habit_tracker_prompt.md` | Benchmark prompt, followed by the evaluation rubric |
| `install-skills.sh` | Minimal installer: installs all three skills (including Jev) into the current folder |
| `auto-install-skills.sh` | Configurable installer with `-d <folder>`, `--with-jev` and `--dry-run` (see `--help`) |
| `<model-name>/` | One run per model: generated app, `.agents/skills/` and `skills-lock.json` |

`skills-lock.json` in a run folder shows which skills were active in that run, so it also tells you whether a run was with or without Jev.

## Running a test

1. Create the model folder: `mkdir <model-name>`
2. Install the skills into it, from this directory:
   - without Jev: `./auto-install-skills.sh -d <model-name>`
   - with Jev: `./auto-install-skills.sh -d <model-name> --with-jev`
3. Start the agent (opencode) in `<model-name>/` and give it the prompt.
   - **Only paste the part above the `---` separator.** The rubric below it is for evaluation and must not be shown to the model.
   - For a run **without Jev**, also remove the section "Arbeitsweise mit Jev" and the Jev part of the closing summary sentence from the pasted prompt.
4. Jev runs need network access and `TYPESAFE_API_KEY` (or `OPENROUTER_API_KEY`) set in the shell that starts the agent. Check once with `jev yes "Ist 1 kleiner als 2?"` before the run.
5. Keep the generated result unchanged in Git, also when the run fails (see [`AGENTS.md`](../../AGENTS.md)).

## Comparison

Per model, two runs with otherwise identical conditions (without Jev, with Jev) allow a clean comparison. Note that Jev runs are not fully local, because Jev calls the TypeSafe API. Results and findings are documented in Notion, not in this folder.

- Prompt page: https://app.notion.com/p/3e98253ebb248154bfc2ed1a92e13f2d
- Project page: https://app.notion.com/p/3e58253ebb2481509990d9277c093f8f
- Benchmark Runs: https://app.notion.com/p/18ff8888f9df4a4ebddb4927e07a8c86
