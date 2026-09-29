import { useCallback, useEffect, useState } from 'react'
import type { ThemePreference } from '../types'

const STORAGE_KEY = 'rhythm:theme'

function readStored(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    /* storage can be unavailable — fall through to system */
  }
  return 'system'
}

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export interface ThemeController {
  preference: ThemePreference
  resolved: 'light' | 'dark'
  isDark: boolean
  setTheme: (next: ThemePreference) => void
}

export function useTheme(): ThemeController {
  const [preference, setPreference] = useState<ThemePreference>(readStored)
  const [systemDark, setSystemDark] = useState<boolean>(prefersDark)

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolved: 'light' | 'dark' =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore storage failures */
    }
  }, [])

  return { preference, resolved, isDark: resolved === 'dark', setTheme }
}
