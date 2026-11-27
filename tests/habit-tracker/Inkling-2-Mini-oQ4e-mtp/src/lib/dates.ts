// Local-time date helpers. All "YYYY-MM-DD" strings reflect the user's local
// calendar day (not UTC), which is what a habit tracker wants.

export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayString(): string {
  return toLocalDateString(new Date());
}

export function parseDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function prevDay(s: string): string {
  const d = parseDateString(s);
  d.setDate(d.getDate() - 1);
  return toLocalDateString(d);
}

/** Whole days between two YYYY-MM-DD strings (b - a). */
export function dayDiff(a: string, b: string): number {
  const ms = parseDateString(b).getTime() - parseDateString(a).getTime();
  return Math.round(ms / 86400000);
}

export function lastNDays(n: number, end = todayString()): string[] {
  const out: string[] = [];
  let d = end;
  for (let i = 0; i < n; i++) {
    out.unshift(d);
    d = prevDay(d);
  }
  return out;
}

export function formatLongDate(s: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(parseDateString(s));
}

export function formatDayLabel(s: string): string {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(parseDateString(s));
}

export function formatDayFull(s: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric'
  }).format(parseDateString(s));
}

export function formatShortDate(s: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }).format(
    parseDateString(s)
  );
}
