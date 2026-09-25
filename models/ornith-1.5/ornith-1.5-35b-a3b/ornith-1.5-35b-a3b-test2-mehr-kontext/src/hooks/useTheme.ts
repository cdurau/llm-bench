import { useEffect, useState } from 'react'

export type ThemeChoice = 'system' | 'light' | 'dark'

const THEME_KEY = 'pulseboard-theme'

function getInitialChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // ignore
  }
  return 'system'
}

function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice === 'light') return 'light'
  if (choice === 'dark') return 'dark'
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) {
    meta.content = theme === 'dark' ? '#0f172a' : '#f8fafc'
  }
}

/**
 * Verwählt und synchronisiert den Dark/Light-Modus. Standard ist das System-
 * Präferenz, die Wahl wird lokal gespeichert.
 */
export function useTheme(): { choice: ThemeChoice; setChoice: (c: ThemeChoice) => void } {
  const [choice, setChoice] = useState<ThemeChoice>(getInitialChoice)

  useEffect(() => {
    const theme = resolveTheme(choice)
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, choice)
    } catch {
      // ignore
    }
  }, [choice])

  return { choice, setChoice }
}
