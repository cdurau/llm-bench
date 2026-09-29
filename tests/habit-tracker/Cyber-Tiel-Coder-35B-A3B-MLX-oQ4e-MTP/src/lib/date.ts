/**
 * Date helpers. Everything is based on local calendar days and the
 * `YYYY-MM-DD` string key, so nothing drifts across timezones or DST.
 */

const pad = (n: number) => String(n).padStart(2, '0')

/** Turn a Date into a local `YYYY-MM-DD` key. */
export function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Parse a `YYYY-MM-DD` key into a local Date at midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Today's local day key. */
export function todayKey(): string {
  return toKey(new Date())
}

/** Add (or subtract) whole days to a key. */
export function addDays(key: string, days: number): string {
  const date = fromKey(key)
  date.setDate(date.getDate() + days)
  return toKey(date)
}

/** Signed whole-day distance from `a` to `b` (`b - a`). */
export function dayDiff(a: string, b: string): number {
  const ms = fromKey(b).getTime() - fromKey(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** The last `count` day keys ending with `end` (inclusive), oldest first. */
export function lastNDays(count: number, end: string = todayKey()): string[] {
  const days: string[] = []
  for (let i = count - 1; i >= 0; i -= 1) {
    days.push(addDays(end, -i))
  }
  return days
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const WEEKDAYS_LONG = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
]
const MONTHS = [
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
]

/** Short weekday, e.g. `Mo`. */
export function weekdayShort(key: string): string {
  return WEEKDAYS[fromKey(key).getDay()]
}

/** Long weekday, e.g. `Montag`. */
export function weekdayLong(key: string): string {
  return WEEKDAYS_LONG[fromKey(key).getDay()]
}

/** Full readable date, e.g. `29. September`. */
export function formatDayMonth(key: string): string {
  const date = fromKey(key)
  return `${date.getDate()}. ${MONTHS[date.getMonth()]}`
}

/** Full readable date, e.g. `Montag, 29. September`. */
export function formatFullDate(key: string): string {
  return `${weekdayLong(key)}, ${formatDayMonth(key)}`
}

/** `Heute` / `Gestern` / long date. */
export function formatRelative(key: string): string {
  const diff = dayDiff(key, todayKey())
  if (diff === 0) return 'Heute'
  if (diff === -1) return 'Gestern'
  if (diff === 1) return 'Morgen'
  return formatFullDate(key)
}
