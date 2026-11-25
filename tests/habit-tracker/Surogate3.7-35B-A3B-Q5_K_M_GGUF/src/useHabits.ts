// --- Central store hook: habits + today's completions ---

import { useState, useEffect, useCallback } from 'react';
import { subscribe } from './events';
import * as db from './db';
import { toLocalDate, computeStreaks } from './utils';
import type { Habit } from './types';

export interface HabitWithStreaks extends Habit {
  completedToday: boolean;
  currentStreak: number;
  longestStreak: number;
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithStreaks[]>([]);
  const [loading, setLoading] = useState(true);
  const today = toLocalDate();

  const reload = useCallback(async () => {
    const list = await db.getAllHabits();
    // fetch today completions per habit
    const byId = new Map<string, boolean>();
    for (const h of list) {
      const d = await db.getCompletedDates(h.id, [today]);
      byId.set(h.id, d.has(today));
    }

    const enriched: HabitWithStreaks[] = await Promise.all(
      list.map(async (h) => {
        // Need all dates for streak; fetch wide range (1 year)
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        const from = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
        const allDates = await db.getCompletedDatesRange(h.id, from, today);
        const { currentStreak, longestStreak } = computeStreaks([...allDates], today);
        return {
          ...h,
          completedToday: byId.get(h.id) ?? false,
          currentStreak,
          longestStreak,
        };
      })
    );

    setHabits(enriched);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    reload();
    return subscribe(reload);
  }, [reload]);

  const addHabit = useCallback(async (h: Omit<Habit, 'id'>) => {
    const created = await db.addHabit(h);
    void created;
    await reload();
  }, [reload]);

  const updateHabit = useCallback(async (h: Habit) => {
    await db.updateHabit(h);
    await reload();
  }, [reload]);

  const deleteHabit = useCallback(async (id: string) => {
    await db.deleteHabit(id);
    await reload();
  }, [reload]);

  const toggleToday = useCallback(async (habitId: string) => {
    const cur = habits.find((h) => h.id === habitId);
    if (!cur) return;

    // Optimistic UI
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, completedToday: !h.completedToday } : h))
    );

    if (cur.completedToday) {
      await db.removeHabitLog(habitId, today);
    } else {
      await db.addHabitLog(habitId, today);
    }
    // Persisted reload for consistency
    await reload();
  }, [habits, today, reload]);

  return { habits, loading, addHabit, updateHabit, deleteHabit, toggleToday };
}
