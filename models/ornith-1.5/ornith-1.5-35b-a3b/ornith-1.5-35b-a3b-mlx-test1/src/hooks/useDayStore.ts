import { useCallback, useEffect, useState } from 'react';
import type { Activity, DayProgress, StoredState } from '@/lib/types';
import {
  importData,
  listActivities,
  readState,
  removeActivity,
  writeState,
} from '@/lib/storage';
import {
  addDays,
  formatDayLabel,
  isFuture,
  todayLocal,
} from '@/lib/dateUtils';
import {
  decrementDayCount,
  setDayCount,
  toggleDayDone,
} from '@/lib/dayLogic';

/** Zentrale State-Verwaltung. */
export interface DayStore {
  activities: Activity[];
  selectedDate: string;
  selectedLabel: string;
  selectedIsFuture: boolean;
  progress: DayProgress;
  loading: boolean;
  error: string | null;

  reload: () => Promise<void>;
  addActivity: (a: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  updateActivity: (a: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  toggleDone: (activity: Activity) => Promise<void>;
  changeCount: (activity: Activity, delta: number) => Promise<void>;
  goTo: (delta: number) => Promise<void>;
  goToToday: () => Promise<void>;
  setDate: (date: string) => void;
  importFromJson: (json: string) => Promise<void>;
}

/** Liest den vollständigen Zustand aus der Persistenz. */
async function loadFreshState(): Promise<StoredState> {
  return readState();
}

export function useDayStore(): DayStore {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [days, setDays] = useState<Record<string, DayProgress>>({});
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await loadFreshState();
      setActivities(state.activities);
      setDays(state.days);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Einmaliges Laden beim ersten Render.
  useEffect(() => {
    void reload();
  }, [reload]);

  const persistActivities = useCallback(async (next: Activity[]) => {
    const state = await loadFreshState();
    state.activities = next;
    state.updatedAt = new Date().toISOString();
    await writeState(state);
  }, []);

  const persistDays = useCallback(async (next: Record<string, DayProgress>) => {
    const state = await loadFreshState();
    state.days = next;
    state.updatedAt = new Date().toISOString();
    await writeState(state);
  }, []);

  const addActivity = useCallback(
    async (input: Omit<Activity, 'id' | 'createdAt'>) => {
      const activity: Activity = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const state = await loadFreshState();
      const next = [...state.activities, activity];
      setActivities(next);
      await persistActivities(next);
    },
    [persistActivities],
  );

  const updateActivity = useCallback(
    async (activity: Activity) => {
      const state = await loadFreshState();
      const next = state.activities.map((a) =>
        a.id === activity.id ? activity : a,
      );
      setActivities(next);
      await persistActivities(next);
    },
    [persistActivities],
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      await removeActivity(id);
      const state = await loadFreshState();
      setActivities(state.activities);
    },
    [],
  );

  const toggleDone = useCallback(
    async (activity: Activity) => {
      if (isFuture(selectedDate)) return; // Zukunft darf nicht abgehakt werden
      const current = days[selectedDate] ?? {};
      const nextProgress = toggleDayDone(activity, current);
      const nextDays = { ...days, [selectedDate]: nextProgress };
      setDays(nextDays);
      await persistDays(nextDays);
    },
    [days, selectedDate, persistDays],
  );

  const changeCount = useCallback(
    async (activity: Activity, delta: number) => {
      if (isFuture(selectedDate)) return;
      const current = days[selectedDate] ?? {};
      const currentCount = Math.max(0, Math.trunc(current[activity.id] ?? 0));
      const nextCount =
        delta > 0
          ? setDayCount(activity.id, currentCount + delta, current)
          : decrementDayCount(activity.id, current);
      const nextDays = { ...days, [selectedDate]: nextCount };
      setDays(nextDays);
      await persistDays(nextDays);
    },
    [days, selectedDate, persistDays],
  );

  const goTo = useCallback((delta: number) => {
    setSelectedDate((d) => addDays(d, delta));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(todayLocal());
  }, []);

  const setDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const importFromJson = useCallback(async (json: string) => {
    const state = await importData(json);
    setActivities(state.activities);
    setDays(state.days);
  }, []);

  return {
    activities,
    selectedDate,
    selectedLabel: formatDayLabel(selectedDate),
    selectedIsFuture: isFuture(selectedDate),
    progress: days[selectedDate] ?? {},
    loading,
    error,
    reload,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleDone,
    changeCount,
    goTo,
    goToToday,
    setDate,
    importFromJson,
  };
}
