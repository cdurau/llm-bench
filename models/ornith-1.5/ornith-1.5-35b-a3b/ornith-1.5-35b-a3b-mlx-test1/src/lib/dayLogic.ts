/**
 * Reine, zustandslose Logik für Tagesfortschritt und Dashboard.
 * Diese Funktionen hängen nicht von IndexedDB ab und sind daher
 * sehr einfach und schnell zu testen.
 */
import type { Activity, DayProgress, StoredState } from './types';

/** Liefert den erledigten Fortschritt einer Aktivität an einem Tag. */
export function getDoneCount(
  activity: Activity,
  progress: DayProgress,
): number {
  return Math.max(0, Math.trunc(progress[activity.id] ?? 0));
}

/** Ist eine Aktivität an diesem Tag als erledigt markiert? */
export function isDone(activity: Activity, progress: DayProgress): boolean {
  return getDoneCount(activity, progress) > 0;
}

/**
 * Wechselt den Status einer Aktivität an einem Tag.
 * Ohne Tagesziel: Klick toggelt zwischen 0 und 1.
 * Mit Tagesziel (>1): inkrementiert die Zählung pro Klick.
 */
export function toggleDayDone(
  activity: Activity,
  progress: DayProgress,
): DayProgress {
  const next = { ...progress };
  const current = getDoneCount(activity, progress);
  if (activity.dailyGoal > 1) {
    next[activity.id] = current + 1;
  } else {
    next[activity.id] = current > 0 ? 0 : 1;
  }
  return next;
}

/** Setzt eine konkrete Zählung (wird z. B. beim Laden/Sichern verwendet). */
export function setDayCount(
  activityId: string,
  count: number,
  progress: DayProgress,
): DayProgress {
  const next = { ...progress };
  if (count <= 0) {
    delete next[activityId];
  } else {
    next[activityId] = Math.max(0, Math.trunc(count));
  }
  return next;
}

/** Reduziert die Zählung um eins (Rückgängig). */
export function decrementDayCount(
  activityId: string,
  progress: DayProgress,
): DayProgress {
  return setDayCount(activityId, getDoneCountById(activityId, progress) - 1, progress);
}

export function getDoneCountById(
  activityId: string,
  progress: DayProgress,
): number {
  return Math.max(0, Math.trunc(progress[activityId] ?? 0));
}

/**
 * Dashboard-Zusammenfassung für einen Tag:
 * - erledigt/offen basierend auf dem Tagesziel (eine Aktivität ist
 *   "erledigt", wenn ihr Fortschritt ihr Ziel erreicht hat).
 */
export interface DaySummary {
  total: number;
  done: number;
  open: number;
  percent: number;
}

export function getDaySummary(
  activities: Activity[],
  progress: DayProgress,
): DaySummary {
  let done = 0;
  for (const a of activities) {
    const count = getDoneCount(a, progress);
    const target = a.dailyGoal > 0 ? a.dailyGoal : 1;
    if (count >= target) done += 1;
  }
  const total = activities.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return {
    total,
    done,
    open: total - done,
    percent,
  };
}

/** Kategorie-Zusammenfassung: je Kategorie erledigte / offene Aktivitäten. */
export interface CategoryStat {
  category: string;
  total: number;
  done: number;
}

export function getCategoryBreakdown(
  activities: Activity[],
  progress: DayProgress,
): CategoryStat[] {
  const map = new Map<string, CategoryStat>();
  for (const a of activities) {
    const key = a.category.trim() || 'Ohne Kategorie';
    let stat = map.get(key);
    if (!stat) {
      stat = { category: key, total: 0, done: 0 };
      map.set(key, stat);
    }
    const target = a.dailyGoal > 0 ? a.dailyGoal : 1;
    const done = getDoneCount(a, progress) >= target;
    stat.total += 1;
    if (done) stat.done += 1;
  }
  return Array.from(map.values()).sort((x, y) =>
    x.category.localeCompare(y.category),
  );
}

/**
 * Sanitiert einen beliebigen, potenziell beschädigten Zustand in einen
 * gültigen `StoredState`. Wirft nie. Entfernt ungültige Aktivitäten und Tage.
 */
export function sanitizeState(raw: unknown): StoredState {
  if (!raw || typeof raw !== 'object') {
    return emptyStateSafe();
  }
  const obj = raw as Partial<StoredState> & Record<string, unknown>;

  const activities = Array.isArray(obj.activities)
    ? obj.activities.map(sanitizeActivity).filter((a): a is Activity => a !== null)
    : [];

  const days: StoredState['days'] = {};
  if (obj.days && typeof obj.days === 'object') {
    for (const [date, progress] of Object.entries(obj.days as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      const cleaned = sanitizeProgress(progress);
      if (Object.keys(cleaned).length > 0) days[date] = cleaned;
    }
  }

  return {
    schemaVersion: 1,
    activities,
    days,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
  };
}

function emptyStateSafe(): StoredState {
  return {
    schemaVersion: 1,
    activities: [],
    days: {},
    updatedAt: new Date().toISOString(),
  };
}

function sanitizeActivity(v: unknown): Activity | null {
  if (!v || typeof v !== 'object') return null;
  const a = v as Record<string, unknown>;
  if (typeof a.name !== 'string' || a.name.trim() === '') return null;
  const goal = typeof a.dailyGoal === 'number' && a.dailyGoal > 0 ? a.dailyGoal : 0;
  return {
    id: typeof a.id === 'string' && a.id ? a.id : crypto.randomUUID(),
    name: a.name.trim(),
    description: typeof a.description === 'string' ? a.description : '',
    category: typeof a.category === 'string' ? a.category : 'Ohne Kategorie',
    dailyGoal: goal,
    createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date().toISOString(),
  };
}

function sanitizeProgress(v: unknown): DayProgress {
  const out: DayProgress = {};
  if (!v || typeof v !== 'object') return out;
  for (const [id, count] of Object.entries(v as Record<string, unknown>)) {
    if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) continue;
    out[id] = Math.trunc(count);
  }
  return out;
}
