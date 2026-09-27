import { useCallback, useEffect, useState } from 'react';
import type { DayKey } from '../lib/types';
import { isValidKey, todayKey } from '../lib/dates';

const HASH_RE = /^#\/(\d{4}-\d{2}-\d{2})$/;

/**
 * Gelesen aus der URL-Hash: `#/2026-09-27` → Tag, sonst (leere/ungültige Hash) → heute.
 * Die Hash ist die einzige Wahrheit für den angezeigten Tag, dadurch bleibt der
 * Tag über Reloads erhalten und Browser-Back/Forward funktioniert.
 */
export function dayFromHash(): DayKey {
  const match = HASH_RE.exec(window.location.hash);
  if (match && isValidKey(match[1])) return match[1];
  return todayKey();
}

/**
 * Angezeigter Tag + Auswahl. `selectDay` schreibt in die Hash und löst
 * `hashchange` aus, worauf der State synchronisiert wird.
 */
export function useSelectedDay(): [DayKey, (day: DayKey) => void] {
  const [day, setDay] = useState<DayKey>(dayFromHash);

  useEffect(() => {
    const onHashChange = () => setDay(dayFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const selectDay = useCallback((next: DayKey) => {
    const hash = `/${next}`;
    if (window.location.hash === hash) {
      // Gleicher Tag: Event würde nicht ausgelöst → State direkt setzen.
      setDay(next);
      return;
    }
    window.location.hash = hash;
  }, []);

  return [day, selectDay];
}
