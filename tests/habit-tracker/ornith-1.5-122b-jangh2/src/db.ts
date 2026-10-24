// Datenschicht: IndexedDB über `idb`. Alles lokal, kein Backend.
import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Habit, Completion, Mood, Settings } from './types'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

interface RhythmSchema extends DBSchema {
  habits: {
    key: string
    value: Habit
  }
  completions: {
    key: string
    value: Completion
    indexes: { byHabit: string }
  }
  moods: {
    key: string
    value: Mood
  }
  meta: {
    key: string
    value: Settings
  }
}

type DB = IDBPDatabase<RhythmSchema>

let dbPromise: Promise<DB> | null = null

export function getDB(): Promise<DB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('habits', { keyPath: 'id' })
        const comp = db.createObjectStore('completions', { keyPath: 'id' })
        comp.createIndex('byHabit', 'habitId')
        db.createObjectStore('moods', { keyPath: 'date' })
        db.createObjectStore('meta', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

// --- Habits ---
export async function loadHabits(): Promise<Habit[]> {
  const db = await getDB()
  return db.getAll('habits')
}

export async function saveHabit(h: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', h)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('habits', id)
  // Entferne auch die zugehörigen Erledigungen.
  const comps = await db.getAllFromIndex('completions', 'byHabit', id)
  const tx = db.transaction('completions', 'readwrite')
  for (const c of comps) await tx.store.delete(c.id)
  await tx.done
}

// --- Completions ---
export async function loadCompletions(): Promise<Completion[]> {
  const db = await getDB()
  return db.getAll('completions')
}

export async function toggleCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['completions'], 'readwrite')
  const id = `${habitId}_${date}`
  const existing = await tx.store.get(id)
  if (existing) {
    await tx.store.delete(id)
  } else {
    await tx.store.put({ id, habitId, date })
  }
  await tx.done
}

// --- Moods ---
export async function loadMoodsSince(date: string): Promise<Mood[]> {
  const db = await getDB()
  return db.getAll('moods')
}

export async function saveMood(m: Mood): Promise<void> {
  const db = await getDB()
  await db.put('moods', m)
}

// --- Settings ---
export async function loadSettings(): Promise<Settings | undefined> {
  const db = await getDB()
  return db.get('meta', 'settings')
}

export async function saveSettings(s: Settings): Promise<void> {
  const db = await getDB()
  await db.put('meta', s)
}