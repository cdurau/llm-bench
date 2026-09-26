# PulseBoard — Design Plan

## Subject
Personal daily habit/activity tracker. Not a to-do list, not a productivity dashboard — a
calm place to check off what matters and see your rhythm. The subject is **daily pulse**:
the small, repeated actions that keep a day healthy.

## Design Principles
- **Quiet confidence**: the interface should feel like a breath, not a notification center.
- **One bold element**: the progress circle is the signature. Everything else stays restrained.
- **No card kits**: no grid of identical rounded cards with matching shadows.
- **Typography as personality**: a single distinctive font family carries the character.
- **Structural honesty**: borders and dividers only where they encode real hierarchy.

## Color Palette
Avoid: cream backgrounds (#F4F1EA), terracotta (#D97757), acid-green, near-black with
one bright accent, SaaS grey-shadow cards.

Chosen palette — cool, restful, slightly chalkboard-inspired:
- **bg**: #1A1D23 (deep slate, not black)
- **surface**: #242832 (subtle elevation)
- **text-primary**: #E8EAED
- **text-secondary**: #9DA5B0
- **accent**: #7EC8E3 (calm sky blue, not electric)
- **success**: #8FD98F (soft sage)
- **border**: #353B45

This avoids the warm-cream/terracotta cluster and the near-black/acid-green cluster.

## Typography
- Single font: **Inter** (clean, highly legible, available via Google Fonts)
- Scale: 16px body, 24px headings, 12px metadata
- No all-caps labels, no monospace for data labels
- Active voice in all UI copy

## Layout
```
┌─────────────────────────────────────┐
│  PulseBoard            [date nav]   │
├─────────────────────────────────────┤
│  ┌──────────┐                        │
│  │ PROGRESS │  Today: Tue, Sep 22    │
│  │  O  67%  │  4 of 6 activities     │
│  └──────────┘  completed             │
├─────────────────────────────────────┤
│  Activities                         │
│  ☑ Morning run       [edit] [del]   │
│  ☐ Read 20 min       [edit] [del]   │
│  ☑ Drink water       [edit] [del]   │
│  ...                                │
├─────────────────────────────────────┤
│  [+ Add activity]                   │
└─────────────────────────────────────┘
```

No eyebrow labels, no "→" on buttons, no middle-dot separators. Left-aligned content.
Single-column on mobile, unchanged on desktop.

## UX Decisions
- Progress shown as a simple circle with percentage, not a bar
- Past dates show as "view only" (completed items grayed)
- Future dates show "no activity yet"
- Empty state: calm illustration text, no upsell
- Error handling: inline validation, no modal dialogs for errors
- Dark mode: built-in via the dark palette (no toggle needed)
- Focus states: 2px accent ring on interactive elements
- Reduced motion: transitions disabled via @media (prefers-reduced-motion)

## PWA
- App name: PulseBoard
- Short name: PulseBoard
- Theme color: #1A1D23
- Background color: #1A1D23
- Icons: generated SVG placeholders (scalable circles with "P")

## Review against defaults
- NOT cream/terracotta: using deep slate + sky blue
- NOT near-black + acid-green: accent is calm blue
- NOT broadsheet layout: single column, no columns, no hairline rules
- NOT SaaS card kit: no cards, flat layout with real dividers
- NOT template chrome: no all-caps eyebrows, no middle dots, no em-dash labels
- NOT single-word accent: no highlighted words in headlines

This design is distinct from the AI-generated default clusters.