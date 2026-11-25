// --- Date & streak utilities ---

/** Return the local date as YYYY-MM-DD. */
export function toLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Return a Date at local midnight for the given YYYY-MM-DD. */
export function dateFromLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Number of days between two YYYY-MM-DD strings (absolute). */
export function daysBetween(a: string, b: string): number {
  return Math.round(Math.abs(dateFromLocal(a).getTime() - dateFromLocal(b).getTime()) / 86400000);
}

/** The last `count` dates ending at `today` (inclusive), newest first. */
export function lastNDates(count: number, today = toLocalDate()): string[] {
  const out: string[] = [];
  const base = dateFromLocal(today);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(toLocalDate(d));
  }
  return out;
}

export const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** Format a YYYY-MM-DD for display: "Do., 24. Nov". */
export function formatDate(dateStr: string): string {
  const d = dateFromLocal(dateStr);
  const wd = WEEKDAYS_DE[d.getDay() === 0 ? 6 : d.getDay() - 1];
  const day = d.getDate();
  const month = MONTHS_DE[d.getMonth()];
  return `${wd}, ${day}. ${month}`;
}

/** Format weekday short. */
export function formatWeekday(dateStr: string): string {
  const d = dateFromLocal(dateStr);
  return WEEKDAYS_DE[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

/** Format day number. */
export function formatDay(dateStr: string): string {
  return String(dateFromLocal(dateStr).getDate());
}

/**
 * Compute current & longest streak for one habit given its completed dates.
 * - currentStreak: consecutive days ending today or yesterday.
 * - longestStreak: longest run in history.
 */
export function computeStreaks(
  completedDates: string[],
  today = toLocalDate()
): { currentStreak: number; longestStreak: number } {
  const sorted = Array.from(new Set(completedDates)).sort();
  const set = new Set(sorted);

  // Longest streak via scan
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || dateFromLocal(sorted[i]).getTime() === dateFromLocal(sorted[i - 1]).getTime() + 86400000) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // Current streak: start at today; if not completed today, try yesterday
  let streak = 0;
  let cursor = dateFromLocal(today);
  const todayStr = toLocalDate(dateFromLocal(today));
  const yesterday = new Date(dateFromLocal(today));
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDate(yesterday);

  const startStr = set.has(todayStr) ? todayStr : yesterdayStr;
  if (!set.has(startStr)) return { currentStreak: 0, longestStreak: longest };

  cursor = dateFromLocal(startStr);
  while (set.has(toLocalDate(cursor))) {
    streak++;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }

  return { currentStreak: streak, longestStreak: longest };
}

/** Generate a short unique id. */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Check whether a date is today. */
export function isToday(dateStr: string): boolean {
  return dateStr === toLocalDate();
}
