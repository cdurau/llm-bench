import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'
export type { Habit, HabitCompletion, MoodEntry } from './types'
import type { Habit, HabitCompletion, MoodEntry } from './types'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

const STORES = {
  habits: 'habits',
  completions: 'completions',
  moods: 'moods',
} as const

let _db: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.habits)) {
        db.createObjectStore(STORES.habits, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.completions)) {
        const store = db.createObjectStore(STORES.completions, { keyPath: 'id' })
        store.createIndex('byDate', 'date')
        store.createIndex('byDateHabit', ['date', 'habitId'])
      }
      if (!db.objectStoreNames.contains(STORES.moods)) {
        db.createObjectStore(STORES.moods, { keyPath: 'date' })
      }
    },
  })
  return _db
}

// --- Habits ---

export async function getHabits(): Promise<Habit[]> {
  const db = await getDB()
  return db.getAll(STORES.habits)
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put(STORES.habits, habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.habits, id)
}

// --- Completions ---

export async function getCompletions(): Promise<HabitCompletion[]> {
  const db = await getDB()
  return db.getAll(STORES.completions)
}

export async function completeHabit(date: string, habitId: string): Promise<void> {
  const db = await getDB()
  const id = `${date}::${habitId}`
  const existing = await db.get(STORES.completions, id)
  if (existing) {
    await db.delete(STORES.completions, id)
  } else {
    const entry: HabitCompletion = { id, date, habitId }
    await db.add(STORES.completions, entry)
  }
}

export async function isCompleted(date: string, habitId: string): Promise<boolean> {
  const db = await getDB()
  const id = `${date}::${habitId}`
  const entry = await db.get(STORES.completions, id)
  return entry !== undefined
}

// --- Moods ---

export async function getMoods(): Promise<MoodEntry[]> {
  const db = await getDB()
  return db.getAll(STORES.moods)
}

export async function saveMood(entry: MoodEntry): Promise<void> {
  const db = await getDB()
  await db.put(STORES.moods, entry)
}

export async function getMood(date: string): Promise<MoodEntry | undefined> {
  const db = await getDB()
  return db.get(STORES.moods, date)
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}
