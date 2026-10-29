import { addDays, dateKey } from './date';

export interface StreakInfo {
  current: number;
  longest: number;
}

function parseKey(key: string): Date {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  const d = Number(key.slice(8, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function computeStreak(dates: Set<string>): StreakInfo {
  let current = 0;
  if (dates.size > 0) {
    const today = new Date();
    let cursor = new Date(today);
    if (!dates.has(dateKey(cursor))) {
      cursor = addDays(cursor, -1);
    }
    while (dates.has(dateKey(cursor))) {
      current += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const sorted = [...dates].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const currentDate = parseKey(key);
    const daysBetween =
      prev === null ? 0 : Math.round((currentDate.getTime() - prev.getTime()) / 86400000);
    run = prev === null || daysBetween !== 1 ? 1 : run + 1;
    if (run > longest) {
      longest = run;
    }
    prev = currentDate;
  }

  return { current, longest };
}