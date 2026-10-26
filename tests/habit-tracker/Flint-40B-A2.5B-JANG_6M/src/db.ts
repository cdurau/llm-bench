import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Completion, Habit, MoodEntry } from './types'

interface RhythmDB extends DBSchema {
  habits: {
    key: string
    value: Habit
  }
  completions: {
    key: [string, string]
    value: Completion
    indexes: {
      'by-habit': string
      'by-date': string
    }
  }
  moods: {
    key: string
    value: MoodEntry
  }
}

const DB_NAME = 'rhythm'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null

export function getDB(): Promise<IDBPDatabase<RhythmDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('completions')) {
          const store = db.createObjectStore('completions', {
            keyPath: ['habitId', 'date'],
          })
          store.createIndex('by-habit', 'habitId')
          store.createIndex('by-date', 'date')
        }
        if (!db.objectStoreNames.contains('moods')) {
          db.createObjectStore('moods', { keyPath: 'date' })
        }
      },
    })
  }
  return dbPromise
}

export interface Snapshot {
  habits: Habit[]
  completions: Completion[]
  moods: MoodEntry[]
}

export async function loadSnapshot(): Promise<Snapshot> {
  const db = await getDB()
  const [habits, completions, moods] = await Promise.all([
    db.getAll('habits'),
    db.getAll('completions'),
    db.getAll('moods'),
  ])
  habits.sort(
    (a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt),
  )
  return { habits, completions, moods }
}

export async function putHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

/** Remove a habit together with all of its completions, atomically. */
export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['habits', 'completions'], 'readwrite')
  const index = tx.objectStore('completions').index('by-habit')
  for await (const cursor of index.iterate(id)) {
    await cursor.delete()
  }
  await tx.objectStore('habits').delete(id)
  await tx.done
}

export async function setCompletion(
  habitId: string,
  date: string,
  done: boolean,
): Promise<void> {
  const db = await getDB()
  if (done) {
    await db.put('completions', { habitId, date })
  } else {
    await db.delete('completions', [habitId, date])
  }
}

export async function putMood(entry: MoodEntry): Promise<void> {
  const db = await getDB()
  await db.put('moods', entry)
}

export async function deleteMood(date: string): Promise<void> {
  const db = await getDB()
  await db.delete('moods', date)
}