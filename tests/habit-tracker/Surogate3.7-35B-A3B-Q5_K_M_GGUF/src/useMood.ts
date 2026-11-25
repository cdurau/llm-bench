// --- Mood hook ---

import { useState, useEffect, useCallback } from 'react';
import { subscribe } from './events';
import * as db from './db';
import { toLocalDate } from './utils';
import type { MoodEntry } from './types';

export function useMood() {
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const today = toLocalDate();

  const reload = useCallback(async () => {
    const found = await db.getMood(today);
    setEntry(found);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    reload();
    return subscribe(reload);
  }, [reload]);

  const setMood = useCallback(async (value: number, note: string = '') => {
    const newEntry: MoodEntry = { date: today, value, note };
    setEntry(newEntry);
    await db.saveMood(newEntry);
  }, [today]);

  const clearNote = useCallback(async () => {
    setEntry((prev) => (prev ? { ...prev, note: '' } : null));
    await db.saveMood({ date: today, value: entry?.value ?? 1, note: '' });
  }, [today, entry]);

  return { entry, loading, setMood, clearNote };
}
