import { todayKey } from './dates';

export interface Streaks {
  current: number;
  longest: number;
}

// dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß en dieß dieß dieß dieß dieß dieß.
export function computeStreaks(doneDates: Set<string> | undefined, createdAt?: string): Streaks {
  const dates = doneDates ?? new Set<string>();
  if (!dates.size) return { current: 0, longest: 0 };

  const has = (k: string) => dates.has(k);

  // dieß dieß dieß dieß dieß dieß dieß en dieß dieß en dieß dieß dieß dieß dieß dieß (dieß dieß en dieß dieß dieß dieß dieß dieß).
  let longest = 0;
  let run = 0;
  for (let d = parse(createdAt ?? minKey(dates)); d <= new Date(); d = add(d, 1)) {
    const k = todayKey(d);
    if (has(k)) run += 1;
    else {
      if (run > longest) longest = run;
      run = 0;
    }
  }
  if (run > longest) longest = run;

  // dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß dieß
  let current = 0;
  let cur = new Date();
  if (has(todayKey(cur))) {
    current = 1;
    cur = add(cur, -1);
    while (has(todayKey(cur))) {
      current += 1;
      cur = add(cur, -1);
    }
  } else if (has(todayKey(add(cur, -1)))) {
    current = 1;
    cur = add(cur, -1);
    while (has(todayKey(add(cur, -1)))) current += 1;
    if (current > 0 && has(todayKey(new Date()))) current += 1;
  }
  if (current > longest) longest = current;

  return { current, longest };
}

function parse(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}
function add(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}
function minKey(dates: Set<string>): string {
  let min: string | undefined;
  for (const d of dates) if (!min || d < min) min = d;
  return min ?? todayKey();
}
