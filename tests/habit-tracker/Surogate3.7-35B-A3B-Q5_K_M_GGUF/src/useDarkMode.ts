// --- Dark mode hook: saved preference, follows system by default ---

import { useState, useEffect, useCallback } from 'react';
import type { DarkModePreference } from './types';

const STORAGE_KEY = 'rhythm-dark-mode';

function resolveTheme(preference: DarkModePreference, systemDark: boolean): boolean {
  if (preference === 'system') return systemDark;
  return preference === 'dark';
}

function readStored(): DarkModePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // ignore
  }
  return 'system';
}

export function useDarkMode() {
  const [preference, setPreferenceState] = useState<DarkModePreference>(readStored);
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  const apply = useCallback((pref: DarkModePreference) => {
    const dark = resolveTheme(pref, systemDark);
    document.documentElement.classList.toggle('dark', dark);
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // ignore
    }
  }, [systemDark]);

  // System preference changes
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq?.addEventListener) return;
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    apply(preference);
  }, [preference, apply]);

  const setPreference = useCallback((p: DarkModePreference) => {
    apply(p);
  }, [apply]);

  return { preference, setPreference };
}
