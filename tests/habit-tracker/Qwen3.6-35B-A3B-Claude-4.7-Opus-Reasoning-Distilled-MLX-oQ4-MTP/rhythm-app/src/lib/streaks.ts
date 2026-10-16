

interface StreakResult {
  current: number;
  longest: number;
}

/* Look back from today, counting consecutively checked days.
 * Returns current streak and longest streak. */
export function calcStreak(
  checks: Array<{ habitId: string; date: string }>,
  habitId: string
): StreakResult {
  const habitChecks = checks
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort();

  let current = 0;
  let longest = 0;

  for (const d of habitChecks) {
    const daysSince = diffDays(d);
    if (daysSince === current + 1 || (current === 0 && daysSince === 0)) {
      if (current + 1 > longest) {
        longest = current + 1;
      }
      current++;
    } else {
      current = 0;
    }
  }

  return {
    current,
    longest,
  };
}

/* not used but kept for future use */
export function calcDailyStats(
  checks: Array<{ habitId: string; date: string }>
): Record<string, number> {
  const grouped: Record<string, number> = {};
  for (const c of checks) {
    grouped[c.date] = (grouped[c.date] || 0) + 1;
  }
  return grouped;
}

function diffDays(dateStr: string): number {
  const today = new Date(todayNormalized());
  const target = new Date(dateStr);
  const diff = (today.getTime() - target.getTime()) / 86400000;
  return Math.round(diff);
}

function todayNormalized(): string {
  return new Date().toISOString().slice(0, 10);
}
