import { useTheme } from '../hooks/useTheme'
import { MoonIcon, SunIcon } from './icons'

/** Umschalter zwischen Light-/Dark-Modus (klickbar, keyboard-freundlich). */
export function ThemeToggle() {
  const { choice, setChoice } = useTheme()
  const isDark = choice === 'dark' || (choice === 'system' && darkModeMatches())

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => setChoice(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Hellen Modus wählen' : 'Dunkelen Modus wählen'}
      aria-pressed={isDark}
      title={choice === 'system' ? 'System' : choice}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

function darkModeMatches(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
