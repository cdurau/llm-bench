/** Mood (Stimmung) definitions. */

export interface MoodDef {
  value: 1 | 2 | 3 | 4 | 5
  emoji: string
  label: string
}

export const MOODS: MoodDef[] = [
  { value: 1, emoji: '\u{1F61E}', label: 'Schwierig' },
  { value: 2, emoji: '\u{1F615}', label: 'Angespannt' },
  { value: 3, emoji: '\u{1F610}', label: 'Neutral' },
  { value: 4, emoji: '\u{1F60A}', label: 'Gute Laune' },
  { value: 5, emoji: '\u{1F604}', label: 'Topfit' }
]

export function moodDef(value: number): MoodDef | undefined {
  return MOODS.find((m) => m.value === value)
}

export function moodLabel(value: number | null | undefined): string {
  if (value == null) return 'Nicht gezeichnet'
  return moodDef(value)?.label ?? 'Nicht gezeichnet'
}
