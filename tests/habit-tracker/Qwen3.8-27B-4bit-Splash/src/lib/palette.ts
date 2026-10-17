import type { HabitColorKey, MoodValue } from './db'

/** Die sechs zurückhaltenden Habit-Farben (WCAG-AA-fähig in Hell und Dunkel). */
export const HABIT_COLORS: { key: HabitColorKey; label: string }[] = [
  { key: 'sage', label: 'Salbei' },
  { key: 'clay', label: 'Ton' },
  { key: 'blue', label: 'Blau' },
  { key: 'lavender', label: 'Lilal' },
  { key: 'sand', label: 'Sand' },
  { key: 'rose', label: 'Rosé' },
]

/** CSS-Variable zur Laufzeit auflösen (schaltet mit dem Dark Mode mit). */
export function habitColorVar(color: HabitColorKey): string {
  return `var(--habit-${color})`
}

/** Kuratiertes Emoji-Set für Habits (Wahl des Nutzers, kein UI-Zierat). */
export const HABIT_EMOJIS = [
  '💧',
  '🏃',
  '📖',
  '🧘',
  '💊',
  '🎸',
  '🎨',
  '🌙',
  '✍️',
  '🍎',
  '🚴',
  '🧹',
  '💪',
  '🌱',
  '☕',
  '🎯',
]

export interface MoodOption {
  value: MoodValue
  emoji: string
  label: string
}

/** Stimmung 1–5, einmal pro Tag. */
export const MOODS: MoodOption[] = [
  { value: 1, emoji: '😖', label: 'sehr schlecht' },
  { value: 2, emoji: '😕', label: 'schlecht' },
  { value: 3, emoji: '😐', label: 'neutral' },
  { value: 4, emoji: '🙂', label: 'gut' },
  { value: 5, emoji: '😄', label: 'sehr gut' },
]

export function moodByValue(value: number): MoodOption | undefined {
  return MOODS.find((m) => m.value === value)
}
