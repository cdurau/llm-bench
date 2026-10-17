// Dark Mode: folgt dem System, manuell übersteuerbar, Auswahl wird gespeichert.

export type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'rhythm.theme'

export function loadThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'light' || raw === 'dark' ? raw : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* Speicher nicht verfügbar: Auswahl gilt nur für diese Sitzung */
  }
}

export function isSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolvedIsDark(mode: ThemeMode): boolean {
  return mode === 'dark' || (mode === 'system' && isSystemDark())
}
