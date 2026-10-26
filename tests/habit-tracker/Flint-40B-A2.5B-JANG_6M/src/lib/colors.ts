export interface HabitColor {
  id: string
  label: string
  /** Saturated tone for dots, rings and bars. */
  value: string
  valueDark: string
}

/**
 * A restrained, slightly desaturated palette. Every habit owns exactly one
 * tone so the interface stays calm even with many habits.
 */
export const HABIT_COLORS: HabitColor[] = [
  { id: 'clay', label: 'Ton', value: '#b4552d', valueDark: '#d98157' },
  { id: 'sage', label: 'Salbei', value: '#5f7a58', valueDark: '#8fae86' },
  { id: 'amber', label: 'Bernstein', value: '#a9761f', valueDark: '#d3a44f' },
  { id: 'slate', label: 'Schiefer', value: '#5b6b7c', valueDark: '#93a7bb' },
  { id: 'plum', label: 'Pflaume', value: '#7a5878', valueDark: '#b28cae' },
  { id: 'rose', label: 'Rose', value: '#a85a66', valueDark: '#d1898f' },
  { id: 'teal', label: 'Petrol', value: '#3d7373', valueDark: '#78b0ae' },
  { id: 'ochre', label: 'Ocker', value: '#8a6a3b', valueDark: '#c2a06a' },
]

export const DEFAULT_COLOR = HABIT_COLORS[0].value

export function colorFor(value: string, dark: boolean): string {
  const match = HABIT_COLORS.find((entry) => entry.value === value)
  if (match) return dark ? match.valueDark : match.value
  return value
}

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
  '🍎',
  '💪',
  '🚶',
  '🚴',
  '🏊',
  '🎸',
  '🎨',
  '🧹',
  '💊',
  '🧠',
  '📵',
  '🗣️',
  '💤',
  '🪥',
  '🧴',
  '🫶',
  '🌊',
  '⛰️',
  '🐾',
  '☕',
  '🧊',
  '🌿',
]

/** Mood scale for the daily check-in. */
export const MOODS = [
  { value: 1, emoji: '😞', label: 'Schlecht', tone: '#8a5a5a' },
  { value: 2, emoji: '🙁', label: 'Mäßig', tone: '#9a7b4f' },
  { value: 3, emoji: '😐', label: 'Okay', tone: '#8a8358' },
  { value: 4, emoji: '🙂', label: 'Gut', tone: '#5f7a58' },
  { value: 5, emoji: '😄', label: 'Sehr gut', tone: '#3d7373' },
] as const

export function moodMeta(value: number) {
  const found = MOODS.find((mood) => mood.value === value)
  return found ?? MOODS[2]
}