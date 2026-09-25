import { STORAGE_KEY, CURRENT_VERSION, CATEGORIES } from '../constants';
import type { AppData, CompletionRecord, Activity } from '../types';

function deserialize(raw: string | null): AppData | null {
  if (raw === null) return null;
  try {
    const data = JSON.parse(raw) as AppData;
    if (typeof data !== 'object' || data === null) return null;
    if (typeof data.version !== 'number' || data.version < 1) return null;
    if (!Array.isArray(data.activities)) return null;
    if (!Array.isArray(data.completions)) return null;
    for (const a of data.activities) {
      if (typeof a.id !== 'string') return null;
      if (typeof a.name !== 'string' || a.name.length === 0) return null;
    }
    for (const c of data.completions) {
      if (typeof c.date !== 'string') return null;
      if (typeof c.completions !== 'object' || c.completions === null) return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function load(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = deserialize(raw);
  if (parsed !== null) return parsed;
  console.warn('PulseBoard: konnte Daten nicht laden, starte mit leerer Datei.');
  return freshData();
}

export function save(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAllCategories(data: AppData): string[] {
  const categories = new Set<string>();
  for (const activity of data.activities) {
    if (activity.category.trim()) categories.add(activity.category.trim());
  }
  const fallback = CATEGORIES.filter(
    (c) => !data.activities.some((a) => a.category === c)
  );
  return [...categories, ...fallback];
}

export function getToday(): string {
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  return utcDate.toISOString().slice(0, 10);
}

export function getYesterday(date: string): string {
  return shiftDate(date, -1);
}

export function getTomorrow(date: string): string {
  return shiftDate(date, 1);
}

function shiftDate(date: string, days: number): string {
  const parts = date.split('-');
  const year = Number(parts[0]!);
  const month = Number(parts[1]!);
  const day = Number(parts[2]!);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function formatGermanDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year!, month! - 1, day!);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'short',
  };
  return d.toLocaleDateString('de-DE', options);
}

export function freshData(): AppData {
  return {
    version: CURRENT_VERSION,
    activities: [],
    completions: [],
  };
}

export function markComplete(
  data: AppData,
  date: string,
  activityId: string,
  completed: boolean
): AppData {
  const existing = data.completions.find((c) => c.date === date);
  let completions: CompletionRecord[];
  if (existing) {
    completions = data.completions.map((c) =>
      c.date === date
        ? { ...c, completions: { ...c.completions, [activityId]: completed } }
        : c
    );
  } else {
    completions = [
      ...data.completions,
      { date, completions: { [activityId]: completed } },
    ];
  }
  return { ...data, completions };
}

export function addActivity(data: AppData, activity: Activity): AppData {
  return { ...data, activities: [...data.activities, activity] };
}

export function updateActivity(
  data: AppData,
  activityId: string,
  updates: Partial<Activity>
): AppData {
  return {
    ...data,
    activities: data.activities.map((a) =>
      a.id === activityId ? { ...a, ...updates } : a
    ),
  };
}

export function removeActivity(data: AppData, activityId: string): AppData {
  return {
    ...data,
    activities: data.activities.filter((a) => a.id !== activityId),
    completions: data.completions
      .map((c) => {
        const newCompletions = { ...c.completions };
        delete newCompletions[activityId];
        return { ...c, completions: newCompletions };
      })
      .filter((c) => Object.keys(c.completions).length > 0),
  };
}

export function getCompletionsForDate(
  data: AppData,
  date: string
): CompletionRecord | undefined {
  return data.completions.find((c) => c.date === date);
}

export function getIsComplete(
  data: AppData,
  date: string,
  activityId: string
): boolean {
  const record = data.completions.find((c) => c.date === date);
  return record?.completions[activityId] === true;
}

export function isFutureDate(date: string): boolean {
  return date > getToday();
}

export function isToday(date: string): boolean {
  return date === getToday();
}
