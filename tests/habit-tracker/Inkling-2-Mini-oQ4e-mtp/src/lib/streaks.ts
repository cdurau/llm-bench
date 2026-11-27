import { dayDiff, prevDay } from './dates';

function uniqueSorted(dates: Iterable<string>): string[] {
  return [...new Set(dates)].sort();
}

/**
 * Current streak: consecutive days up to today. If today is not done yet,
 * the streak is counted up to yesterday (today is still in progress).
 */
export function currentStreak(doneDates: Set<string>, today: string): number {
  let d = today;
  if (!doneDates.has(today)) d = prevDay(today);
  let n = 0;
  while (doneDates.has(d)) {
    n++;
    d = prevDay(d);
  }
  return n;
}

export function longestStreak(doneDates: Set<string>): number {
  const sorted = uniqueSorted(doneDates);
  let max = 0;
  let run = 0;
  let prev = '';
  for (const d of sorted) {
    if (prev && dayDiff(prev, d) === 1) run++;
    else run = 1;
    if (run > max) max = run;
    prev = d;
  }
  return max;
}
