# Tasks

## High Priority

- Update the Notion **Benchmark Runs** database properties on `https://app.notion.com/p/41b8253ebb24817eb41aeaa92a3c5810` for `tests/fokusrad-mini/Qwen3.8-27B-4bit/` (PARTIAL; page body and icon are already updated).
- Add the Notion **Benchmark Runs** entry for `tests/fokusrad-mini/Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp/` (PASS) once the Notion connector is enabled.

## Medium Priority

- Share the selected Notion pages to the web and check the README links without a login.
- Use the updated skill source for the next new Habit Tracker run and let `--check` verify the resulting hashes.

## Low Priority

- Recheck skills.sh after its index refreshes; its legacy page still references the removed source repository.

## Done

- Evaluate `tests/fokusrad-mini/Qwen3.8-27B-4bit/` (build/lint/PWA/Chrome checks, reproduction of `SessionView.tsx` first-character auto-advance & edit space-trimming bug, timing/token extraction) and update `README.md` results overview.
- Evaluate `tests/fokusrad-mini/Qwen3.8-Flash-Next-oQ2.5e-fp16-mtp/` (19/19 Playwright E2E checks, WCAG contrast audit, timing/oMLX log extraction) and update `README.md` results overview.
- Publish the repository with redacted history, `LICENSE`, and a README results overview.
- Point `minimalist-ui` installation to `leonxlnx/taste-skill-classics`.
- Verify Bash syntax, dry-run, and an isolated end-to-end installation without changing an existing run.
- Initialize compact project memory files.
