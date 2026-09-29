/**
 * A restrained, slightly desaturated palette. Each habit owns exactly one
 * tone so the interface stays calm even with many habits. `value` is the
 * light-mode tone, `valueDark` the darker, more saturated read for dark mode.
 */
export interface HabitColor {
  id: string
  label: string
  value: string
  valueDark: string
}

export const HABIT_COLORS: HabitColor[] = [
  { id: 'clay', label: 'Ton', value: '#b4552d', valueDark: '#d98157' },
  { id: 'sage', label: 'Salbei', value: '#5f7a58', valueDark: '#8fae86' },
  { id: 'amber', label: 'Bernstein', value: '#a9761f', valueDark: '#d3a44f' },
  { id: 'slate', label: 'Schiefer', value: '#5b6b7c', valueDark: '#93a7bb' },
  { id: 'plum', label: 'Pflaume', value: '#7a5878', valueDark: '#b28cae' },
  { id: 'rose', label: 'Rose', value: '#a85a66', valueDark: '#d1898f' },
]

export const DEFAULT_COLOR = HABIT_COLORS[0].value

/** Curated, neutral emoji set for habits. */
export const HABIT_EMOJIS = [
  '🌱',
  '💧',
  '🏃',
  '🧘',
  '📚',
  '✍️',
  '🎯',
  '☀️',
  '🌙',
  '🥗',
  '💪',
  '🚶',
  '🎸',
  '🧹',
  '💊',
  '🧠',
  '🪥',
  '☕',
  '🌿',
]

/** Mood scale for the daily check-in. */
export const MOODS = [
  { value: 1, emoji: '😞', label: 'Schlecht' },
  { value: 2, emoji: '🙁', label: 'Mäßig' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Sehr gut' },
] as const

export function moodMeta(value: number) {
  return MOODS.find((m) => m.value === value) ?? MOODS[2]
}

export function colorFor(value: string, dark: boolean): string {
  const match = HABIT_COLORS.find((c) => c.value === value)
  if (match) return dark ? match.valueDark : match.value
  return value
}
