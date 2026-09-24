import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pulseboard:theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Dark-Mode-Management. Respektiert die Systemvoreinstellung beim ersten
 * Aufruf und speichert eine bewusste Auswahl im localStorage.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => resolveInitial());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage ggf. nicht verfügbar — kein Absturz.
    }
  }, [theme]);

  // Voreinstellung beobachten, falls das OS wechselt — aber nur, wenn der
  // Nutzer noch keine bewusste Auswahl getroffen hat.
  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      try {
        const explicit = localStorage.getItem(STORAGE_KEY) !== null;
        if (explicit) return;
      } catch {
        // ignore
      }
      setTheme(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggle };
}

function resolveInitial(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore
  }
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}
