// Zurückhaltende, warme Akzentfarben für Habits.
// `light`/`dark` sind die pro Mode verwendete Farbe (je WCAG AA auf dem jeweiligen Hintergrund),
// `soft`/`softDark` sind die dezenten Chip-Hintergründe.
export interface HabitColor {
  id: string
  label: string
  light: string
  dark: string
  soft: string
  softDark: string
}

export const HABIT_COLORS: HabitColor[] = [
  { id: 'teal', label: 'Teal', light: '#2e6b5f', dark: '#6fc3b8', soft: '#edf3ec', softDark: '#162a27' },
  { id: 'blue', label: 'Blau', light: '#1f6c9f', dark: '#74b8e6', soft: '#e1f3fe', softDark: '#142333' },
  { id: 'amber', label: 'Bernstein', light: '#956400', dark: '#d9a75c', soft: '#fbf3db', softDark: '#2a2113' },
  { id: 'red', label: 'Rot', light: '#9f2f2d', dark: '#e08785', soft: '#fdebec', softDark: '#2e1a19' },
  { id: 'purple', label: 'Violett', light: '#6b4aa5', dark: '#c0a2e6', soft: '#f0e9f7', softDark: '#221a33' },
  { id: 'rose', label: 'Rose', light: '#9f3d6b', dark: '#e09cc0', soft: '#fde7ef', softDark: '#2e1823' },
  { id: 'slate', label: 'Schiefer', light: '#4a5568', dark: '#a0a8b4', soft: '#e9ecf0', softDark: '#1e2229' },
  { id: 'moss', label: 'Moos', light: '#4c7a4a', dark: '#9fd39a', soft: '#eaf2e6', softDark: '#182a17' },
]

export function getColor(id: string): HabitColor {
  return HABIT_COLORS.find((c) => c.id === id) ?? HABIT_COLORS[0]
}

/** Akzentfarbe für SVG-Fills (Recharts), je aktuellem Theme. */
export function accentHex(effectiveTheme: 'light' | 'dark'): string {
  return effectiveTheme === 'dark' ? getColor('teal').dark : getColor('teal').light
}