import { useEffect, useState } from 'react'
import { loadTheme, saveTheme } from './storage'
import type { ThemeMode } from './types'

const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

// Theme-Klassenschalter (.dark auf <html>) + theme-color-Meta-Sync,
// weil die App per Klasse (nicht per OS-Media) umstellt.
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => loadTheme())

  useEffect(() => {
    saveTheme(mode)
  }, [mode])

  useEffect(() => {
    const apply = () => {
      const resolved = mode === 'system' ? (darkMedia.matches ? 'dark' : 'light') : mode
      document.documentElement.classList.toggle('dark', resolved === 'dark')
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', resolved === 'dark' ? '#161d19' : '#f2eee4')
    }
    apply()
    if (mode !== 'system') return
    darkMedia.addEventListener('change', apply)
    return () => darkMedia.removeEventListener('change', apply)
  }, [mode])

  return { mode, setMode }
}
