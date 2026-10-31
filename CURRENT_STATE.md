# Current State

## Working

- Habit Tracker prompts, installers, OpenCode/Pi sandbox launchers, and verification tooling are present.
- `auto-install-skills.sh` now installs `minimalist-ui` from `leonxlnx/taste-skill-classics` for new runs.
- `bash -n`, dry-run, and a full installation into an isolated temporary folder succeeded.

## In Progress

- No script migration work is in progress.

## Not Working / Risks

- New session logs can contain private data when a model lists folders outside its run. Scan them before committing.
- The legacy skills.sh page for `leonxlnx/taste-skill/minimalist-ui` still shows the removed repository source.
- Existing runs contain their historical skill versions and may fail `--check` against current upstream. Do not update closed runs.

## Recent Changes

- 2026-10-31: Merged the duplicate `OMLX-Benchmarks/` and `oMLX-Benchmarks/` trees into the single `oMLX-Benchmarks/` folder.
- 2026-10-31: Published the repository as a new public `cdurau/llm-bench` with redacted history; the previous private repository is `cdurau/llm-bench-private-archive`.
- 2026-10-31: Added `LICENSE` (MIT, own material only) and a README results overview.
- 2026-10-24: Updated the `minimalist-ui` source after its upstream classic skills moved.
- 2026-10-24: Initialized compact repository project memory.

## Current Blockers

- None.

## Next Steps

- Use the updated installer for the next new Habit Tracker run in a fresh model folder.
- Record the resulting benchmark in Notion and link the exact Git path.
