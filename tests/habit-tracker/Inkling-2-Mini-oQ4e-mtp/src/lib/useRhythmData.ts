import { useCallback, useEffect, useState } from 'react';
import type { Habit, MoodEntry } from './types';
import {
  loadHabits,
  saveHabit,
  deleteHabit,
  loadCompletions,
  putCompletion,
  deleteCompletion,
  loadMoods,
  saveMood,
  deleteMood,
  clearAllData,
  exportAllData
} from './db';
import { todayString } from './dates';

export interface DataState {
  ready: boolean;
  habits: Habit[];
  /** date -> set of habitIds done that day */
  done: Map<string, Set<string>>;
  moods: Record<string, MoodEntry>;
}

const empty: DataState = { ready: false, habits: [], done: new Map(), moods: {} };

export function useRhythmData() {
  const [data, setData] = useState<DataState>(empty);

  const reload = useCallback(async () => {
    const [habits, completions, moods] = await Promise.all([
      loadHabits(),
      loadCompletions(),
      loadMoods()
    ]);
    const done = new Map<string, Set<string>>();
    for (const c of completions) {
      if (!done.has(c.date)) done.set(c.date, new Set());
      done.get(c.date)!.add(c.habitId);
    }
    const moodsRec: Record<string, MoodEntry> = {};
    for (const m of moods) moodsRec[m.date] = m;
    setData({ ready: true, habits: habits.map((h) => h), done, moods: moodsRec });
  }, []);

  useEffect(() => {
    reload().catch(() => setData({ ready: true, habits: [], done: new Map(), moods: {} }));
  }, [reload]);

  const toggleHabit = useCallback(
    async (habitId: string) => {
      const date = todayString();
      const set = data.done.get(date);
      const already = !!set?.has(habitId);
      if (already) await deleteCompletion(habitId, date);
      else await putCompletion(habitId, date);
      await reload();
    },
    [data.done, reload]
  );

  const addHabit = useCallback(
    async (habit: Habit) => {
      await saveHabit(habit);
      await reload();
    },
    [reload]
  );

  const updateHabit = useCallback(
    async (habit: Habit) => {
      await saveHabit(habit);
      await reload();
    },
    [reload]
  );

  const removeHabit = useCallback(
    async (id: string) => {
      await deleteHabit(id);
      await reload();
    },
    [reload]
  );

  const setMood = useCallback(
    async (date: string, mood: number, note: string) => {
      const updatedAt = Date.now();
      await saveMood({ date, mood, note, updatedAt });
      await reload();
    },
    [reload]
  );

  const removeMood = useCallback(
    async (date: string) => {
      await deleteMood(date);
      await reload();
    },
    [reload]
  );

  const exportJson = useCallback(async () => exportAllData(), []);

  const clearAll = useCallback(async () => {
    await clearAllData();
    await reload();
  }, [reload]);

  return {
    ...data,
    reload,
    toggleHabit,
    addHabit,
    updateHabit,
    removeHabit,
    setMood,
    removeMood,
    exportJson,
    clearAll
  };
}

export type RhythmData = ReturnType<typeof useRhythmData>;
