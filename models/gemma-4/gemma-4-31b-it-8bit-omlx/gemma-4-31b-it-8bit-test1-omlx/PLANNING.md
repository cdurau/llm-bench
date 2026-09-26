# PLANNING.md - PulseBoard

## 1. Goal
A minimalist, production-ready PWA for daily activity tracking.

## 2. Technical Stack
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (for speed and consistency)
- **PWA:** `vite-plugin-pwa`
- **Persistence:** LocalStorage (with a versioned wrapper)
- **Testing:** Vitest + React Testing Library

## 3. Data Model
The data will be stored as a JSON object in LocalStorage.

### Schema Versioning
`{ version: number, data: { ... } }`

### Entities
- **Activity**:
    - `id`: string (UUID)
    - `name`: string
    - `description`: string (optional)
    - `category`: string
    - `dailyGoal`: number (optional)
    - `createdAt`: timestamp
- **DailyStatus**:
    - Key: `YYYY-MM-DD`
    - Value: `Map<ActivityID, boolean>`

## 4. Component Architecture
- `App`: Main wrapper, Theme provider, Day provider.
- `Layout`: Responsive shell.
- `Header`: Day navigation and current date display.
- `Dashboard`: Progress metrics and category summaries.
- `ActivityList`: The core list of activities with checkboxes.
- `ActivityManager`: Modal/Form for adding/editing activities.
- `PersistenceProvider`: Context for handling data loading/saving.

## 5. UX/UI Design Plan ("The Calm Horizon")

The design avoids the "SaaS-dashboard" cliché (no rounded cards, no soft shadows) and instead opts for a digital journal aesthetic—clean, focused, and serene.

### Color Palette
- **Light Mode:**
  - Base: `#FDFCFB` (Warm paper)
  - Primary Text: `#292524` (Deep stone)
  - Accent (Pulse): `#6B8E23` (Olive Drab - organic growth)
  - Secondary/Border: `#D6D3D1` (Warm grey)
  - Disabled/Pending: `#E7E5E4` (Light stone)
- **Dark Mode:**
  - Base: `#1A1A1C` (Deep charcoal)
  - Primary Text: `#E7E5E4` (Light stone)
  - Accent (Pulse): `#8DA447` (Lighter olive)
  - Secondary/Border: `#3F3F46` (Muted charcoal)

### Typography
- **Headings (Date):** Elegant Serif (System Serif) to evoke a journal feeling.
- **UI/Body:** Clean Sans-Serif (Inter/System Sans) for maximum legibility.
- **Treatment:** Sentence case for all labels. No all-caps. Generous line-height.

### Layout & Structure
- **Containment:** Centered column (max-width 600px).
- **Hierarchy:**
  - **Date Header:** Large serif date, minimalist navigation arrows.
  - **Pulse Meter:** A single, elegant progress bar (not a circle) that fills with the Olive accent.
  - **Activity List:** Items separated by hairline dividers. No cards.
  - **Interaction:** Checked items subtly fade in opacity and shift color to indicate completion without being visually noisy.

### Principles
- **Quietude:** High whitespace, minimal borders, no decorative gradients.
- **Focus:** Only the current day's tasks are prominent.
- **Tactility:** Focus states and active elements are clearly defined but subtle.

## 6. Roadmap
1. [ ] Project Initialization & Base Config
2. [ ] Persistence Layer & Versioning
3. [ ] Core Activity CRUD
4. [ ] Day Navigation & Status Tracking
5. [ ] Dashboard Implementation
6. [ ] PWA Configuration
7. [ ] Design Polish (Frontend Design skill)
8. [ ] Comprehensive Testing
9. [ ] Production Build & Final Audit
