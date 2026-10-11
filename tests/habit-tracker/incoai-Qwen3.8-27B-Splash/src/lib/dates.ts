/** Datumshilfen – alles lokal, als Schlüssel im Format YYYY-MM-DD. */

export function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toKey(new Date())
}

export function addDays(key: string, days: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

/** Die letzten n Tage (ältester zuerst), endend am heutigen Tag. */
export function lastNDays(n: number, end = todayKey()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i))
  return out
}

const longDate = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const shortDate = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'short',
})

const monthOnly = new Intl.DateTimeFormat('de-DE', { month: 'long' })

const weekdayShort = new Intl.DateTimeFormat('de-DE', { weekday: 'short' })

export function formatLongDate(key: string): string {
  return longDate.format(fromKey(key))
}

export function formatShortDate(key: string): string {
  return shortDate.format(fromKey(key)).replace('.', '')
}

export function formatWeekdayShort(key: string): string {
  return weekdayShort.format(fromKey(key)).replace('.', '')
}

/** Beispiel: „8. – 14. Oktober" bzw. „28. Sept. – 4. Okt." bei Monatswechsel. */
export function formatWeekRange(startKey: string, endKey: string): string {
  const start = fromKey(startKey)
  const end = fromKey(endKey)
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}. – ${end.getDate()} ${monthOnly.format(end)}`
  }
  return `${formatShortDate(startKey)} – ${formatShortDate(endKey)}`
}
