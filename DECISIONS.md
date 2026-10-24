# Decisions

## Decision Log

- Date: 2026-10-24
- Decision: Install `minimalist-ui` from `leonxlnx/taste-skill-classics` in `tests/habit-tracker/auto-install-skills.sh`.
- Reason: The upstream repository removed its classic skills on 2026-10-19 and moved them to the classics repository under the same install names. The old source now exposes only `design-taste-frontend`, so installation of `minimalist-ui` fails.
- Alternatives Considered: Keep the old source (broken for `minimalist-ui`); use the skills.sh mirror `tasteskill/tasteskill` (works, but the upstream owner’s classics repository is the canonical new location).
- Consequences: New runs use the current classic `minimalist-ui` content from the moved repository. Existing runs remain untouched and may intentionally differ from current upstream.
