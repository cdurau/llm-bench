export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(dateStr: string, days: number): string {
  const dt = new Date(dateStr + 'T00:00:00');
  dt.setDate(dt.getDate() + days);
  return todayStr(dt);
}

const TAGESNAMEN = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const MONATE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export function formatGermanDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const wochentag = TAGESNAMEN[d.getDay()];
  const tageskürzel = wochentag ? wochentag + ' ' : '';
  const tag = d.getDate();
  const monat = MONATE[d.getMonth()] ?? '';
  const jahr = d.getFullYear();
  const heute = todayStr();
  if (dateStr === heute) {
    return `Heute · ${tageskürzel}${tag}. ${monat} ${jahr}`;
  }
  return `${tageskürzel}${tag}. ${monat} ${jahr}`;
}

export function last7Days(): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - i);
    out.push(todayStr(cursor));
  }
  return out;
}

export function shortDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${TAGESNAMEN[d.getDay()]} ${d.getDate()}`;
}

export interface Streaks {
  current: number;
  longest: number;
}

export function computeStreaks(completedDates: string[]): Streaks {
  const set = new Set(completedDates);
  const heute = todayStr();

  // Aktuelle Serie: lückelose Kette bis heute (oder bis gestern, wenn heute noch offen).
  let current = 0;
  let cursor = new Date(heute + 'T00:00:00');
  if (!set.has(heute)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(todayStr(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Längste Serie je zuvor abgeschlossener Kette.
  const sorted = [...set].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev !== null && addDays(prev, 1) === day) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = day;
  }

  return { current, longest };
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export const THEME_KEY = 'rhythm-theme';

export type ThemeOverride = 'light' | 'dark' | null;

export function getOverride(): ThemeOverride {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function systemIsDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function applyThemeClass(): void {
  const override = getOverride();
  const dark = override ? override === 'dark' : systemIsDark();
  document.documentElement.classList.toggle('dark', dark);
}

export function currentThemeLabel(): string {
  const override: 'light' | 'dark' | null = getOverride();
  if (override) return override === 'dark' ? 'Dunkel' : 'Hell';
  return systemIsDark() ? 'Nach System · Dunkel' : 'Nach System · Hell';
}

export function toggleTheme(): 'light' | 'dark' {
  const override = getOverride();
  const effectiveDark = override ? override === 'dark' : systemIsDark();
  const next: 'light' | 'dark' = effectiveDark ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* Storage kann in privaten Modes gesperrt sein – dann reicht die direkte Klasse. */
  }
  document.documentElement.classList.toggle('dark', next === 'dark');
  return next;
}
