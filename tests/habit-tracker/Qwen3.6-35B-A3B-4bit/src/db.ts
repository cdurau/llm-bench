import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

// ── Types ──

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface CheckIn {
  habitId: string
  date: string // YYYY-MM-DD
}

export interface MoodEntry {
  date: string // YYYY-MM-DD
  value: number // 1-5
  note?: string
}

// ── DB singleton ──

let _db: IDBPDatabase | null = null

async function open(): Promise<IDBPDatabase> {
  if (!_db) {
    _db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('habits', { keyPath: 'id' })
        const cs = db.createObjectStore('checkins', { keyPath: ['habitId', 'date'] })
        cs.createIndex('byHabit', 'habitId')
        db.createObjectStore('moods', { keyPath: 'date' })
      },
    })
  }
  return _db
}

// ── Habits ──

export async function getHabits(): Promise<Habit[]> {
  return (await open()).getAll('habits')
}

export async function addHabit(name: string, emoji: string, color: string): Promise<string> {
  const id = crypto.randomUUID()
  await (await open()).put('habits', { id, name, emoji, color, createdAt: Date.now() })
  return id
}

export async function updateHabit(id: string, partial: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>): Promise<void> {
  const db = await open()
  const h = await db.get('habits', id)
  if (h) Object.assign(h, partial), await db.put('habits', h)
}

export async function removeHabit(id: string): Promise<void> {
  await (await open()).delete('habits', id)
}

// ── Check-ins ──

export async function getCheckinsToday(): Promise<Set<string>> {
  const habits = await getHabits()
  const today = getTodayString()
  const set = new Set<string>()
  for (const habit of habits) {
    const c = await (await open()).get('checkins', [habit.id, today])
    if (c) set.add(habit.id)
  }
  return set
}

export async function toggleCheckIn(habitId: string): Promise<void> {
  const db = await open()
  const today = getTodayString()
  const exists = await db.get('checkins', [habitId, today])
  if (exists) await db.delete('checkins', [habitId, today])
  else await db.put('checkins', { habitId, date: today })
}

export interface DailyCounts {
  date: string
  completed: string[]
  mood?: MoodEntry
}

export async function getWeeklyData(): Promise<DailyCounts[]> {
  const habits = await getHabits()
  const db = await open()
  const data: DailyCounts[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)

    const completed: string[] = []
    for (const habit of habits) {
      const c = await db.get('checkins', [habit.id, dateStr])
      if (c) completed.push(habit.id)
    }

    const mood = await db.get('moods', dateStr)

    data.push({ date: dateStr, completed, mood })
  }

  return data
}

// ── Streaks (async-friendly) ──

export interface Streaks {
  current: number
  longest: number
}

export async function getStreaks(): Promise<Record<string, Streaks>> {
  const habits = await getHabits()
  const db = await open()
  const result: Record<string, Streaks> = {}

  for (const habit of habits) {
    // Current streak
    let current = 0
    let d = new Date()
    d.setHours(0, 0, 0, 0)

    while (true) {
      const dateStr = d.toISOString().slice(0, 10)
      const c = await db.get('checkins', [habit.id, dateStr])
      if (c) {
        current++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    // Longest streak: scan all months (last 365 days)
    let longest = 0
    let running = 0
    for (let offset = 365; offset >= 0; offset--) {
      const check = new Date()
      check.setDate(check.getDate() - offset)
      check.setHours(0, 0, 0, 0)
      const dateStr = check.toISOString().slice(0, 10)
      const c = await db.get('checkins', [habit.id, dateStr])
      if (c) {
        running++
        longest = Math.max(longest, running)
      } else {
        running = 0
      }
    }

    result[habit.id] = { current, longest }
  }

  return result
}

// ── Moods ──

export async function saveMood(value: number, note?: string): Promise<void> {
  const today = getTodayString()
  await (await open()).put('moods', { date: today, value, note })
}

export async function getTodayMood(): Promise<MoodEntry | null> {
  return (await open()).get('moods', getTodayString())
}

// ── Helpers ──

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDateGerman(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(d, 10)}. ${months[parseInt(m, 10) - 1]} ${y}`
}

// ── Theme storage ──

const THEME_KEY = 'rhythm-theme-mode'

export function readTheme(): 'light' | 'dark' | null {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function writeTheme(mode: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    /* offline storage may reject — that's fine */
  }
}

export function systemDark(): boolean {
  try {
    return !!matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}
