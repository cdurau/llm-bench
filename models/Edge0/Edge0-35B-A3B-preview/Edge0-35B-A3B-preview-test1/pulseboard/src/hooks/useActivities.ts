import { useState, useCallback, useEffect } from 'react';
import { Activity, StoredData, ActivityWithStatus } from '../types';
import { readStoredData, writeStoredData } from '../utils/storage';
import { formatDateKey } from '../utils/date';

function persist(data: StoredData): void {
  writeStoredData(data);
}

export function useActivities() {
  const [data, setData] = useState<StoredData>(() => readStoredData() || {
    version: 1,
    activities: [],
    dayStatus: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const save = useCallback(
    (fn: (d: StoredData) => StoredData) => {
      setData((prev) => {
        const next = fn(prev);
        persist(next);
        return next;
      });
    },
    []
  );

  const addActivity = useCallback(
    (name: string, description: string | undefined, category: string, dailyGoal?: number) => {
      save((d) => {
        const activity: Activity = {
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description?.trim() || undefined,
          category,
          dailyGoal,
          createdAt: new Date().toISOString(),
        };
        return { ...d, activities: [...d.activities, activity], updatedAt: new Date().toISOString() };
      });
    },
    [save]
  );

  const updateActivity = useCallback(
    (id: string, name: string, description: string | undefined, category: string, dailyGoal?: number) => {
      save((d) => ({
        ...d,
        activities: d.activities.map((a) =>
          a.id === id
            ? { ...a, name: name.trim(), description: description?.trim() || undefined, category, dailyGoal }
            : a
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [save]
  );

  const removeActivity = useCallback(
    (id: string) => {
      save((d) => ({
        ...d,
        activities: d.activities.filter((a) => a.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [save]
  );

  return {
    activities: data.activities,
    addActivity,
    updateActivity,
    removeActivity,
  };
}

export function useDayStatus(date: Date) {
  const dateKey = formatDateKey(date);

  const [data, setData] = useState<StoredData>(() => readStoredData() || {
    version: 1,
    activities: [],
    dayStatus: {},
    createdAt: '',
    updatedAt: '',
  });

  useEffect(() => {
    const fresh = readStoredData();
    if (fresh) setData(fresh);
  }, [dateKey]);

  const save = useCallback(
    (fn: (d: StoredData) => StoredData) => {
      setData((prev) => {
        const next = fn(prev);
        persist(next);
        return next;
      });
    },
    []
  );

  const toggleActivity = useCallback(
    (activityId: string) => {
      save((d) => {
        const current = d.dayStatus[dateKey] || {};
        const wasDone = current[activityId] ?? false;
        const newStatus = { ...current, [activityId]: !wasDone };

        return {
          ...d,
          dayStatus: { ...d.dayStatus, [dateKey]: newStatus },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [dateKey, save]
  );

  return {
    dayStatus: data.dayStatus,
    dateKey,
    activities: data.activities,
    toggleActivity,
  };
}

export function useActivitiesWithStatus(date: Date): ActivityWithStatus[] {
  const { dayStatus, dateKey, activities } = useDayStatus(date);
  const todayKey = formatDateKey(new Date());
  const isFuture = dateKey > todayKey;

  return activities
    .map((activity) => {
      const doneToday = (dayStatus[dateKey]?.[activity.id] ?? false) && !isFuture;
      const goal = activity.dailyGoal;
      const progressPercent = goal ? Math.min(100, (doneToday ? 1 : 0) * 100) : (doneToday ? 100 : 0);
      return { ...activity, doneToday, doneCount: doneToday ? 1 : 0, progressPercent };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
