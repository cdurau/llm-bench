/** Local-date helpers. Dates are represented as 'YYYY-MM-DD' strings. */

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

/** Parse 'YYYY-MM-DD' as a local date (at noon to avoid DST edge cases). */
export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export function addDays(dateStr: string, n: number): string {
  const d = parseDateStr(dateStr)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export function diffDays(a: string, b: string): number {
  // b - a in whole days
  const ms = parseDateStr(b).getTime() - parseDateStr(a).getTime()
  return Math.round(ms / 86400000)
}

export function lastNDays(n: number, end: string = todayStr()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i))
  return out
}

export function formatLong(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parseDateStr(dateStr))
}

export function formatShort(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric'
  }).format(parseDateStr(dateStr))
}

export function weekdayShort(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(parseDateStr(dateStr))
}

export function dayMonthShort(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short' }).format(parseDateStr(dateStr))
}
