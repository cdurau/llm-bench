# Current State

## Working

- Fokusrad Mini (`tests/fokusrad-mini/`) prompts, skill installers (`mobile-native`, `mobile-app-ui-design`, `vite-pwa-patterns`, optional `jev`), and sandbox launchers are in place.
- First Fokusrad Mini run (`tests/fokusrad-mini/Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp/`, OpenCode v2 + oMLX, without Jev) completed with **PASS** (19/19 Playwright E2E checks, offline reload, and `tsc -b` verified; session logs checked for private paths with 0 findings).
- Second Fokusrad Mini run (`tests/fokusrad-mini/Qwen3.8-27B-4bit/`, OpenCode v2 + oMLX/Splash, without Jev) evaluated as **PARTIAL** (240.27 min, 118,751 generated tokens incl. reasoning, 98.93% cache efficiency; Build & PWA/offline reload PASS, but `SessionView.tsx` saves and advances `nextOpen` on the first typed character without Enter and trims spaces while editing, missed by Playwright `fill()` checks).
- Habit Tracker prompts, installers, OpenCode/Pi sandbox launchers, and verification tooling are present.
- `auto-install-skills.sh` now installs `minimalist-ui` from `leonxlnx/taste-skill-classics` for new runs.
- `bash -n`, dry-run, and a full installation into an isolated temporary folder succeeded.

## In Progress

- Notion **Benchmark Runs** entry for `tests/fokusrad-mini/Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp/` is pending until the Notion MCP connector is connected.
- Notion **Benchmark Runs** page for `tests/fokusrad-mini/Qwen3.8-27B-4bit/` (`https://app.notion.com/p/41b8253ebb24817eb41aeaa92a3c5810`) has the full evaluation content and `🟡` icon, while its database properties still need manual update from the duplicated template.

## Not Working / Risks

- New session logs can contain private data when a model lists folders outside its run. Scan them before committing.
- The legacy skills.sh page for `leonxlnx/taste-skill/minimalist-ui` still shows the removed repository source.
- Existing runs contain their historical skill versions and may fail `--check` against current upstream. Do not update closed runs.

## Recent Changes

- 2026-11-26: Strict OpenCode sandbox returns ENOENT for blocked reads so parent Git discovery does not abort with EPERM; blocked reads and writes remain denied.
- 2026-11-17: Evaluated `tests/fokusrad-mini/Qwen3.8-27B-4bit/` (PARTIAL, 240.27 min, 118,751 generated tokens, ~8.24 tok/s effective / 11.32 tok/s active decode) and updated `README.md`, `CURRENT_STATE.md`, `TASKS.md`, plus Notion evaluation page body (`41b8253ebb24817eb41aeaa92a3c5810`).
- 2026-11-15: Evaluated and documented `tests/fokusrad-mini/Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp/` (PASS, 192.9 min total wall-clock / 111.0 min active Assistant+Compaction time, 91,595 generated tokens at 14.44 tok/s effective / ~16.0 tok/s in oMLX log) in `README.md`, `AGENTS.md`, `ARCHITECTURE.md`, and `MEMORY.md`.
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
