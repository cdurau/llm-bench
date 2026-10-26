import type { ThemeMode } from './types'

const STORAGE_KEY = 'rhythm.theme'

/** Wendet den Theme-Modus auf das Dokument an und speichert ihn. */
export function applyTheme(mode: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', mode)
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // localStorage kann in manchen Umgebungen blockiert sein; nicht fatal.
  }
}

/** Liest die gespeicherte Präferenz (oder null). */
export function readStoredTheme(): ThemeMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // ignore
  }
  return null
}
