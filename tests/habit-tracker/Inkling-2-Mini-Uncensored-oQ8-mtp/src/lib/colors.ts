/** Habit color palette. Light/dark variants kept WCAG-AA friendly. */

export type HabitColorKey =
  | 'clay'
  | 'forest'
  | 'teal'
  | 'slate'
  | 'ochre'
  | 'plum'
  | 'sage'

export interface HabitColor {
  key: HabitColorKey
  label: string
  light: string
  dark: string
}

export const HABIT_COLORS: HabitColor[] = [
  { key: 'clay', label: 'Terrakotta', light: '#B4542C', dark: '#E08E5F' },
  { key: 'forest', label: 'Waldgrün', light: '#3E6B4F', dark: '#8FBF9C' },
  { key: 'teal', label: 'Teal', light: '#2F6B6B', dark: '#7FC0BB' },
  { key: 'slate', label: 'Steingrau', light: '#3F5E7A', dark: '#8FA8C4' },
  { key: 'ochre', label: 'Ocker', light: '#8A6A1F', dark: '#D8B65C' },
  { key: 'plum', label: 'Pflaume', light: '#6E4A63', dark: '#C99BB8' },
  { key: 'sage', label: 'Salbei', light: '#4A6B3F', dark: '#A3C98F' }
]

export function habitColor(key: HabitColorKey, resolved: 'light' | 'dark'): string {
  const found = HABIT_COLORS.find((c) => c.key === key)
  if (!found) return HABIT_COLORS[0].light
  return resolved === 'dark' ? found.dark : found.light
}

export function habitColorLabel(key: HabitColorKey): string {
  return HABIT_COLORS.find((c) => c.key === key)?.label ?? key
}

export function habitColorLight(key: HabitColorKey): string {
  return habitColor(key, 'light')
}

export function habitColorDark(key: HabitColorKey): string {
  return habitColor(key, 'dark')
}

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
