import { Activity, StoredData, ActivityWithStatus, CURRENT_SCHEMA_VERSION } from '../types';
import { formatDateKey } from '../utils/date';

// Core storage — accessible for testing
export function readStoredData(): StoredData | null {
  try {
    const raw = localStorage.getItem('pulseboard');
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Validate schema version
    if (typeof parsed.version !== 'number' || parsed.version > CURRENT_SCHEMA_VERSION) {
      return null;
    }

    // Basic shape validation
    if (!Array.isArray(parsed.activities)) return null;
    if (parsed.dayStatus && typeof parsed.dayStatus !== 'object') return null;

    // Ensure required fields on activities
    const validated = parsed.activities.map((a: Record<string, unknown>) => {
      const name = typeof a.name === 'string' && a.name.trim() ? a.name.trim() : 'Ohne Titel';
      return {
        id: typeof a.id === 'string' ? a.id : crypto.randomUUID(),
        name,
        description: typeof a.description === 'string' ? a.description : undefined,
        category: (typeof a.category === 'string' && a.category.trim()) ? a.category : 'Sonstiges',
        dailyGoal:
          typeof a.dailyGoal === 'number' && a.dailyGoal > 0
            ? a.dailyGoal
            : undefined,
        createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date().toISOString(),
      };
    });

    const sanitizedDayStatus: Record<string, Record<string, boolean>> =
      parsed.dayStatus && typeof parsed.dayStatus === 'object' && !Array.isArray(parsed.dayStatus)
        ? parsed.dayStatus
        : {};

    return {
      version: CURRENT_SCHEMA_VERSION,
      activities: validated,
      dayStatus: sanitizedDayStatus,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeStoredData(data: StoredData): void {
  localStorage.setItem(
    'pulseboard',
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() })
  );
}

export function createEmptyData(): StoredData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    activities: [],
    dayStatus: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export interface UseActivitiesReturn {
  activities: Activity[];
  addActivity: (name: string, description: string | undefined, category: string, dailyGoal?: number) => void;
  updateActivity: (id: string, name: string, description: string | undefined, category: string, dailyGoal?: number) => void;
  removeActivity: (id: string) => void;
}

export function useActivities(initial: StoredData): UseActivitiesReturn {
  let data = initial;
  let listeners: Array<(d: StoredData) => void> = [];

  const persist = (d: StoredData) => {
    writeStoredData(d);
    listeners.forEach((fn) => fn(d));
  };

  return {
    get activities() {
      return data.activities;
    },
    addActivity: (name: string, description: string | undefined, category?: string, dailyGoal?: number) => {
      const activity: Activity = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description?.trim() || undefined,
        category: category || 'Sonstiges',
        dailyGoal,
        createdAt: new Date().toISOString(),
      };
      data = { ...data, activities: [...data.activities, activity], updatedAt: new Date().toISOString() };
      persist(data);
    },
    updateActivity: (id: string, name: string, description: string | undefined, category: string, dailyGoal?: number) => {
      data = {
        ...data,
        activities: data.activities.map((a) =>
          a.id === id
            ? { ...a, name: name.trim(), description: description?.trim() || undefined, category, dailyGoal }
            : a
        ),
        updatedAt: new Date().toISOString(),
      };
      persist(data);
    },
    removeActivity: (id: string) => {
      data = {
        ...data,
        activities: data.activities.filter((a) => a.id !== id),
        updatedAt: new Date().toISOString(),
      };
      persist(data);
    },
  };
}

export interface UseDayStatusReturn {
  dayStatus: Record<string, Record<string, boolean>>;
  dateKey: string;
  activities: Activity[];
  toggleActivity: (activityId: string) => void;
  getActivitiesWithStatus: (activities: Activity[]) => ActivityWithStatus[];
}

export function useDayStatus(initial: StoredData, date: Date): UseDayStatusReturn {
  const dateKey = formatDateKey(date);

  let data = initial;
  let listeners: Array<(d: StoredData) => void> = [];

  const persist = (d: StoredData) => {
    writeStoredData(d);
    listeners.forEach((fn) => fn(d));
  };

  const toggleActivity = (activityId: string) => {
    const current = data.dayStatus[dateKey] || {};
    const wasDone = current[activityId] ?? false;
    const newStatus = { ...current, [activityId]: !wasDone };
    data = {
      ...data,
      dayStatus: { ...data.dayStatus, [dateKey]: newStatus },
      updatedAt: new Date().toISOString(),
    };
    persist(data);
  };

  const getActivitiesWithStatus = (activities: Activity[]): ActivityWithStatus[] => {
    const todayKey = formatDateKey(new Date());
    const isFuture = dateKey > todayKey;

    return activities
      .map((activity) => {
        const doneToday = (data.dayStatus[dateKey]?.[activity.id] ?? false) && !isFuture;
        const doneCount = doneToday ? 1 : 0;
        const progressPercent = activity.dailyGoal
          ? activity.dailyGoal > 1 ? (doneCount / activity.dailyGoal) * 100 : (doneToday ? 100 : 0)
          : (doneToday ? 100 : 0);
        return {
          ...activity,
          doneToday,
          doneCount,
          progressPercent: Math.min(100, Math.round(progressPercent)),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return {
    get dayStatus() { return data.dayStatus; },
    get dateKey() { return dateKey; },
    get activities() { return data.activities; },
    toggleActivity,
    getActivitiesWithStatus,
  };
}
