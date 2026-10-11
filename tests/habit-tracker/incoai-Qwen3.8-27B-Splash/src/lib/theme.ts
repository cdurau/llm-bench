import { useCallback, useEffect, useState } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'rhythm-theme'
const QUERY = '(prefers-color-scheme: dark)'

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches
}

function readStored(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function resolve(pref: ThemePreference): ThemeMode {
  return pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref
}

/**
 * Theme-Einstellung (System/Hell/Dunkel) mit Persistenz; die Lösung passiert
 * live, inkl. Reaktion auf Systemwechsel im „system"-Modus.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStored)
  const [mode, setMode] = useState<ThemeMode>(() => resolve(readStored()))

  useEffect(() => {
    const apply = () => {
      const resolved = resolve(preference)
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      setMode(resolved)
    }
    apply()
    if (preference !== 'system') return
    const mq = window.matchMedia(QUERY)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [preference])

  const setTheme = useCallback((p: ThemePreference) => {
    setPreference(p)
    try {
      if (p === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, p)
    } catch {
      /* Speichern nicht möglich – Einstellung gilt nur für diese Sitzung */
    }
  }, [])

  return { preference, mode, setTheme }
}
