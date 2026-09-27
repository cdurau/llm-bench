import type { Activity, AppData, DayKey, DayProgress } from '../lib/types';
import { isFuture } from '../lib/dates';
import { emptyData } from '../lib/storage';

/** Eingehende Aktionen des Stores. */
export type Action =
  | { type: 'activity/add'; activity: Omit<Activity, 'id' | 'createdAt'> }
  | {
      type: 'activity/update';
      id: string;
      patch: Pick<Activity, 'name' | 'description' | 'category' | 'target'>;
    }
  | { type: 'activity/delete'; id: string }
  | { type: 'progress/toggle'; date: DayKey; id: string }
  | { type: 'progress/decrement'; date: DayKey; id: string }
  /** Kompletter Datenersatz (z. B. Reset nach nicht lesbaren gespeicherten Daten). */
  | { type: 'data/replace'; data: AppData };

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Zählstand für eine Aktivität am Tag, immer 0..target.
 * Fehlt die Aktivität (gelöscht) oder der Tag → 0.
 */
export function countFor(
  data: AppData,
  date: DayKey,
  activity: Pick<Activity, 'id' | 'target'>,
): number {
  const raw = data.progress[date]?.[activity.id] ?? 0;
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(raw, Math.max(activity.target, 1));
}

/** Erledigt = Zählstand erreicht das Tagesziel. */
export function isDone(
  data: AppData,
  date: DayKey,
  activity: Pick<Activity, 'id' | 'target'>,
): boolean {
  return countFor(data, date, activity) >= Math.max(activity.target, 1);
}

function dayEntry(data: AppData, date: DayKey): { day: DayProgress } {
  return { day: data.progress[date] ?? {} };
}

/**
 * Reducer. Bewusst pure und strikt:
 * - Toggle nur für nicht-künftige Tage (zweite Verteidigung neben der UI).
 * - Zähl-Semantik: volle Menge erreicht → zurück auf 0, sonst +1 (max. target).
 * - Deleted Aktivitäten werden aus allen Tageseinträgen bereinigt.
 */
export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'activity/add': {
      const activity: Activity = {
        id: createId(),
        createdAt: new Date().toISOString(),
        ...action.activity,
      };
      return { ...state, activities: [...state.activities, activity] };
    }

    case 'activity/update': {
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === action.id ? { ...a, ...action.patch } : a,
        ),
      };
    }

    case 'activity/delete': {
      if (!state.activities.some((a) => a.id === action.id)) return state;
      const progress: AppData['progress'] = {};
      for (const [day, dayProgress] of Object.entries(state.progress)) {
        if (!(action.id in dayProgress)) {
          progress[day] = dayProgress;
          continue;
        }
        const copy: DayProgress = { ...dayProgress };
        delete copy[action.id];
        if (Object.keys(copy).length > 0) progress[day] = copy;
      }
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== action.id),
        progress,
      };
    }

    case 'progress/toggle': {
      if (isFuture(action.date)) return state;
      const activity = state.activities.find((a) => a.id === action.id);
      if (!activity) return state;
      const { day } = dayEntry(state, action.date);
      const current = countFor(state, action.date, activity);
      const target = Math.max(activity.target, 1);
      const next = current >= target ? 0 : current + 1;
      const dayProgress: DayProgress = { ...day, [action.id]: next };
      if (next === 0) delete dayProgress[action.id];
      return { ...state, progress: { ...state.progress, [action.date]: dayProgress } };
    }

    case 'progress/decrement': {
      if (isFuture(action.date)) return state;
      const activity = state.activities.find((a) => a.id === action.id);
      if (!activity) return state;
      const { day } = dayEntry(state, action.date);
      const current = countFor(state, action.date, activity);
      if (current <= 0) return state;
      const next = current - 1;
      const dayProgress: DayProgress = { ...day };
      if (next === 0) delete dayProgress[action.id];
      else dayProgress[action.id] = next;
      return { ...state, progress: { ...state.progress, [action.date]: dayProgress } };
    }

    case 'data/replace':
      return action.data;

    default:
      return state;
  }
}

/* ---------- Selectoren (pure, getestete Funktionen) ---------- */

export interface DayStats {
  total: number;
  done: number;
  open: number;
  /** 0..100, gerundet; 0 ohne Aktivitäten. */
  percent: number;
}

export function statsForDay(data: AppData, date: DayKey): DayStats {
  const total = data.activities.length;
  const done = data.activities.filter((a) => isDone(data, date, a)).length;
  const open = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, open, percent };
}

export interface CategoryStat {
  category: string;
  total: number;
  done: number;
}

/** Übersicht nach Kategorie, alphabetisch sortiert (ruhig, vorhersagbar). */
export function categoryStats(data: AppData, date: DayKey): CategoryStat[] {
  const byCategory = new Map<string, CategoryStat>();
  for (const activity of data.activities) {
    const entry =
      byCategory.get(activity.category) ?? { category: activity.category, total: 0, done: 0 };
    entry.total += 1;
    if (isDone(data, date, activity)) entry.done += 1;
    byCategory.set(activity.category, entry);
  }
  return [...byCategory.values()].sort((a, b) => a.category.localeCompare(b.category, 'de'));
}

/** Leere Umsatzzähler für Tests/Reset. */
export function freshData(): AppData {
  return emptyData();
}
