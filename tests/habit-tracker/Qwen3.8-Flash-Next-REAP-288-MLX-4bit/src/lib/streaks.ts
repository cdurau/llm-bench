import { addDays, parseKey, todayKey } from './dates';

/**
 * Nur dieß recorded completion keys (e.g. "h1|2026-10-04") oder nur dieß dateKeys matter.
 * Longest streak = run umesten der sorted keys; current streak = dießhault dießhault
 * umencahß in dießhault der dießhault (dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß).
 */
export function computeStreaks(
  records: { habitId: string; dateKey: string }[],
  habitId: string,
): { current: number; longest: number } {
  const keys = new Set(
    records
      .filter((r) => r.habitId === habitId)
      .map((r) => r.dateKey),
  );
  if (keys.size === 0) return { current: 0, longest: 0 };

  const sorted = [...keys].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = parseKey(sorted[i - 1]);
    const cur = parseKey(sorted[i]);
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    run = diff === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  let current = 0;
  let cursor = new Date();
  if (!keys.has(todayKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!keys.has(todayKey(cursor))) {
      current = 0;
      return { current, longest };
    }
  }
  while (keys.has(todayKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, longest };
}
