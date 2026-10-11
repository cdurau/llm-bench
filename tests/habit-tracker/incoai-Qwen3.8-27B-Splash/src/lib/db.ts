import { openDB, type IDBPDatabase } from 'idb'

/** Das gesamte Datenmodell lebt lokal in IndexedDB – kein Backend. */

export interface Habit {
  id: string
  name: string
  emoji: string
  /** Id aus HABIT_COLORS. */
  color: string
  createdAt: string
}

export interface Completion {
  /** `${habitId}::${date}` */
  id: string
  habitId: string
  /** YYYY-MM-DD */
  date: string
}

export interface MoodEntry {
  /** YYYY-MM-DD (eintrag pro Tag) */
  date: string
  /** 1–5 */
  value: number
  note: string
}

const DB_NAME = 'rhythm'
const DB_VERSION = 1

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function completionId(habitId: string, date: string): string {
  return `${habitId}::${date}`
}

interface DBSchema {
  habits: {
    key: string
    value: Habit
    indexes: { createdAt: string }
  }
  completions: {
    key: string
    value: Completion
    indexes: { habitId: string; date: string }
  }
  moods: {
    key: string
    value: MoodEntry
  }
}

export type RhythmDB = IDBPDatabase<DBSchema>

let dbPromise: Promise<RhythmDB> | null = null

export function getDb(): Promise<RhythmDB> {
  if (!dbPromise) {
    dbPromise = openDB<DBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const habits = db.createObjectStore('habits', { keyPath: 'id' })
        habits.createIndex('createdAt', 'createdAt')
        const completions = db.createObjectStore('completions', { keyPath: 'id' })
        completions.createIndex('habitId', 'habitId')
        completions.createIndex('date', 'date')
        db.createObjectStore('moods', { keyPath: 'date' })
      },
    })
  }
  return dbPromise
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDb()
  return db.getAllFromIndex('habits', 'createdAt')
}

export async function putHabit(habit: Habit): Promise<void> {
  const db = await getDb()
  await db.put('habits', habit)
}

export async function deleteHabitWithCompletions(habitId: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['habits', 'completions'], 'readwrite')
  const completions = await tx.objectStore('completions').index('habitId').getAllKeys(habitId)
  for (const key of completions) await tx.objectStore('completions').delete(key)
  await tx.objectStore('habits').delete(habitId)
  await tx.done
}

export async function addCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDb()
  await db.put('completions', { id: completionId(habitId, date), habitId, date })
}

export async function deleteCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDb()
  await db.delete('completions', completionId(habitId, date))
}

export async function getAllCompletions(): Promise<Completion[]> {
  const db = await getDb()
  return db.getAll('completions')
}

export async function getAllMoods(): Promise<MoodEntry[]> {
  const db = await getDb()
  return db.getAll('moods')
}

export async function putMood(entry: MoodEntry): Promise<void> {
  const db = await getDb()
  await db.put('moods', entry)
}

export async function deleteMood(date: string): Promise<void> {
  const db = await getDb()
  await db.delete('moods', date)
}

export async function clearAllData(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['habits', 'completions', 'moods'], 'readwrite')
  await Promise.all([
    tx.objectStore('habits').clear(),
    tx.objectStore('completions').clear(),
    tx.objectStore('moods').clear(),
  ])
  await tx.done
}
