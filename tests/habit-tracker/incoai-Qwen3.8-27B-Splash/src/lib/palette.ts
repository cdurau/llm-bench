/** Farb- und Emoticon-Paletten des App. */

export interface HabitColor {
  id: string
  name: string
  /** Akzent im hellen Modus. */
  light: string
  /** Akzent im dunklen Modus (leicht aufgehellt, bleibt gedämpft). */
  dark: string
  /** Weiche Kartenfläche im hellen Modus. */
  softLight: string
}

export const HABIT_COLORS: HabitColor[] = [
  { id: 'clay', name: 'Terrakotta', light: '#a2491f', dark: '#dd8a5e', softLight: '#f7eae1' },
  { id: 'moss', name: 'Moos', light: '#4c6b33', dark: '#a3bc83', softLight: '#edf2e6' },
  { id: 'lake', name: 'See', light: '#31648e', dark: '#84aac9', softLight: '#e8f0f6' },
  { id: 'plum', name: 'Pflaume', light: '#7d4a66', dark: '#c68fa6', softLight: '#f3eaf0' },
  { id: 'gold', name: 'Ocker', light: '#8a6a1c', dark: '#d2b35c', softLight: '#f6efdc' },
  { id: 'slate', name: 'Schiefer', light: '#55565b', dark: '#a9a9a3', softLight: '#f0f0ee' },
]

export const HABIT_EMOJIS = [
  '💧',
  '🏃',
  '📖',
  '🧘',
  '✍️',
  '💪',
  '🦷',
  '😴',
  '🥗',
  '🚶',
  '🎨',
  '🪴',
]

export interface MoodLevel {
  value: number
  emoji: string
  label: string
}

export const MOOD_LEVELS: MoodLevel[] = [
  { value: 1, emoji: '😞', label: 'Schwer' },
  { value: 2, emoji: '😕', label: 'Durchwachsen' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Hervorragend' },
]

export function moodByValue(value: number): MoodLevel {
  return MOOD_LEVELS[Math.min(4, Math.max(0, Math.round(value) - 1))]
}

/** Akzentfarbe einer Gewohnheit je nach aktuellem Modus. */
export function habitAccent(colorId: string, mode: 'light' | 'dark'): string {
  const c = HABIT_COLORS.find((c) => c.id === colorId) ?? HABIT_COLORS[0]
  return mode === 'dark' ? c.dark : c.light
}

/** Weiche Untergrundfläche einer Gewohnheitsfarbe (hellt via Farbmischung). */
export function habitSoftColor(colorId: string, mode: 'light' | 'dark'): string {
  const c = HABIT_COLORS.find((c) => c.id === colorId) ?? HABIT_COLORS[0]
  if (mode === 'dark') {
    return `color-mix(in srgb, ${c.dark} 16%, transparent)`
  }
  return c.softLight
}

/**
 * Zeichenfarbe für Symbole auf einer gefüllten Akzentfläche.
 * Hell: die Akzente sind dunkel → weiß; Dunkel: die Akzente sind hell → Tinte.
 * (Beide Kombinationen sind per tools/check-contrast.mjs auf ≥ 3:1 geprüft.)
 */
export function glyphOnAccent(_accent: string, mode: 'light' | 'dark'): string {
  return mode === 'dark' ? '#111111' : '#ffffff'
}
