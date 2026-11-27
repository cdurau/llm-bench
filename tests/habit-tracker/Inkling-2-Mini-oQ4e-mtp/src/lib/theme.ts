import type { ThemePreference } from './types';

const STORAGE_KEY = 'rhythm-theme';

export function getStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* ignore */
  }
  return 'system';
}

export function storeTheme(t: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function isDark(pref: ThemePreference): boolean {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return systemPrefersDark();
}

/** Apply the dark class to <html> for the given preference. */
export function applyTheme(pref: ThemePreference): void {
  const dark = isDark(pref);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#14120e' : '#F7F6F3');
}
