import { openDB } from 'idb'
import type { Habit, HabitCompletion, MoodEntry } from './types'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

let dbPromise: Promise<any> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('habits', { keyPath: 'id' })
        const cs = db.createObjectStore('completions', { keyPath: 'id', autoIncrement: true })
        cs.createIndex('habitId', 'habitId')
        cs.createIndex('date', 'date')
        db.createObjectStore('moods', { keyPath: 'date' })
      },
    })
  }
  return dbPromise
}

// Habits
export async function getHabits(): Promise<Habit[]> {
  const db = await getDb()
  return db.getAll('habits')
}

export async function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
  const db = await getDb()
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  await db.put('habits', newHabit)
  return newHabit
}

export async function updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDb()
  const habit = await db.get('habits', id)
  if (habit) {
    await db.put('habits', { ...habit, ...updates })
  }
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('habits', id)
  const tx = db.transaction('completions', 'readwrite')
  const store = tx.objectStore('completions')
  const all = await store.getAll()
  for (const c of all) {
    if ((c as HabitCompletion).habitId === id) {
      await store.delete(c.id)
    }
  }
  await tx.done
}

// Completions
export async function getCompletions(): Promise<HabitCompletion[]> {
  const db = await getDb()
  return db.getAll('completions')
}

export async function getCompletionForDate(habitId: string, date: string): Promise<HabitCompletion | null> {
  const db = await getDb()
  const all = await db.getAll('completions')
  return all.find((c: HabitCompletion) => c.habitId === habitId && c.date === date) ?? null
}

export async function toggleCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDb()
  const existing = await getCompletionForDate(habitId, date)
  if (existing) {
    await db.delete('completions', existing.id)
  } else {
    await db.put('completions', { habitId, date })
  }
}

// Moods
export async function getMoods(): Promise<MoodEntry[]> {
  const db = await getDb()
  return db.getAll('moods')
}

export async function getMoodForDate(date: string): Promise<MoodEntry | null> {
  const db = await getDb()
  return db.get('moods', date)
}

export async function saveMood(entry: Omit<MoodEntry, 'date'> & { date: string }): Promise<void> {
  const db = await getDb()
  await db.put('moods', entry)
}

// Streak calculation (pure function, no DB needed)
export function calcStreak(habits: Habit[], completions: HabitCompletion[]): Record<string, { current: number; best: number }> {
  const result: Record<string, { current: number; best: number }> = {}

  for (const habit of habits) {
    const dates = completions
      .filter((c) => c.habitId === habit.id)
      .map((c) => c.date)
      .sort()

    let current = 0
    let best = 0
    let temp = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate current streak
    const dateSet = new Set(dates)
    let d = new Date(today)
    const todayStr = formatDate(today)
    if (!dateSet.has(todayStr)) {
      d.setDate(d.getDate() - 1)
    }
    while (true) {
      const ds = formatDate(d)
      if (dateSet.has(ds)) {
        current++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate best streak
    if (dates.length > 0) {
      const sorted = [...new Set(dates)].sort()
      temp = 1
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]!)
        const curr = new Date(sorted[i]!)
        prev.setHours(0, 0, 0, 0)
        curr.setHours(0, 0, 0, 0)
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          temp++
        } else {
          temp = 1
        }
        best = Math.max(best, temp)
      }
    }

    result[habit.id] = { current, best }
  }

  return result
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getTodayStr(): string {
  return formatDate(new Date())
}

export function getLast7Days(): string[] {
  const days: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(formatDate(d))
  }
  return days
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateStr === formatDate(today)) return 'Heute'
  if (dateStr === formatDate(yesterday)) return 'Gestern'
  if (dateStr === formatDate(tomorrow)) return 'Morgen'

  return d.toLocaleDateString('de-DE', { weekday: 'short' })
}
