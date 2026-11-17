import { useEffect, useState } from 'react'
import type { ThemePreference } from './types'

export type ResolvedTheme = 'light' | 'dark'

/** Wendet das Wunsch-Theme auf (System-Wunsch folgt der OS-Einstellung). */
export function resolveTheme(preference: ThemePreference, system: ResolvedTheme): ResolvedTheme {
  return preference === 'system' ? system : preference
}

/** Beobachtet die `prefers-color-scheme`-Einstellung des Systems. */
export function useSystemTheme(): ResolvedTheme {
  const [system, setSystem] = useState<ResolvedTheme>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      setSystem(event.matches ? 'dark' : 'light')
    }
    setSystem(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return system
}

/**
 * Trägt das aufgelöste Theme aus: `.dark`-Klasse auf <html> und
 * `theme-color`-Meta (der Browser-Chrome nimmt die Farbe darüber an).
 */
export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved === 'dark')

  const color = resolved === 'dark' ? '#131c1a' : '#f6f1e8'
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((element) => element.remove())
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = color
  document.head.appendChild(meta)
}
