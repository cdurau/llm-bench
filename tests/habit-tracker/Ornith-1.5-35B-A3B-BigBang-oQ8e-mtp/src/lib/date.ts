export function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

export function keyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayKey(): string {
  return keyOf(new Date())
}

export function toDate(key: string): Date {
  const [year, month, day] = key.split("-").map((n) => Number(n))
  return new Date(year, month - 1, day)
}

export function addDaysKey(key: string, delta: number): string {
  return keyOf(addDays(toDate(key), delta))
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + delta)
  return next
}

export function isToday(key: string): boolean {
  return key === todayKey()
}

export function isYesterday(key: string): boolean {
  return key === addDaysKey(todayKey(), -1)
}

export function formatGerman(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function formatShort(key: string): string {
  return toDate(key).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
}

export function weekdayShort(key: string): string {
  return toDate(key).toLocaleDateString("de-DE", { weekday: "short" })
}
