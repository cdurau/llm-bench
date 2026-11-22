import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Habit, Completion, MoodEntry, Settings } from './types'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

interface RhythmDB extends DBSchema {
  habits: {
    key: string
    value: Habit
  }
  completions: {
    key: number
    value: Completion
    indexes: {
      'by-date': string
      'by-habit': string
      'by-habit-date': [string, string]
    }
  }
  moods: {
    key: number
    value: MoodEntry
    indexes: {
      'by-date': string
    }
  }
  settings: {
    key: string
    value: Settings
  }
}

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null

function getDB(): Promise<IDBPDatabase<RhythmDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('habits', { keyPath: 'id' })
        const completions = db.createObjectStore('completions', {
          keyPath: 'id',
          autoIncrement: true
        })
        completions.createIndex('by-date', 'date')
        completions.createIndex('by-habit', 'habitId')
        completions.createIndex('by-habit-date', ['habitId', 'date'], { unique: true })

        const moods = db.createObjectStore('moods', {
          keyPath: 'id',
          autoIncrement: true
        })
        moods.createIndex('by-date', 'date', { unique: true })

        db.createObjectStore('settings', { keyPath: 'id' })
      }
    })
  }
  return dbPromise
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB()
  const habits = await db.getAll('habits')
  return habits.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function addHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['habits', 'completions'], 'readwrite')
  await tx.objectStore('habits').delete(id)
  const completions = await tx.objectStore('completions').index('by-habit').getAll(id)
  for (const c of completions) {
    await tx.objectStore('completions').delete(c.id!)
  }
  await tx.done
}

export async function toggleCompletion(habitId: string, date: string): Promise<boolean> {
  const db = await getDB()
  const existing = await db.getFromIndex('completions', 'by-habit-date', [habitId, date])
  if (existing) {
    await db.delete('completions', existing.id!)
    return false
  }
  await db.add('completions', { habitId, date })
  return true
}

export async function getAllCompletions(): Promise<Completion[]> {
  const db = await getDB()
  return db.getAll('completions')
}

export async function getCompletionsForHabit(habitId: string): Promise<string[]> {
  const db = await getDB()
  const rows = await db.getAllFromIndex('completions', 'by-habit', habitId)
  return rows.map((r) => r.date)
}

export async function getMoods(): Promise<MoodEntry[]> {
  const db = await getDB()
  return db.getAll('moods')
}

export async function getMood(date: string): Promise<MoodEntry | undefined> {
  const db = await getDB()
  const rows = await db.getAllFromIndex('moods', 'by-date', date)
  return rows[0]
}

export async function setMood(date: string, mood: 1 | 2 | 3 | 4 | 5, note?: string): Promise<void> {
  const db = await getDB()
  const existing = await db.getAllFromIndex('moods', 'by-date', date)
  const entry: MoodEntry = { date, mood, note: note?.trim() ? note.trim() : undefined }
  if (existing[0]) {
    entry.id = existing[0].id
    await db.put('moods', entry)
  } else {
    await db.add('moods', entry)
  }
}

export async function clearMood(date: string): Promise<void> {
  const db = await getDB()
  const existing = await db.getAllFromIndex('moods', 'by-date', date)
  if (existing[0]) await db.delete('moods', existing[0].id!)
}

export async function getSetting(id: string): Promise<Settings | undefined> {
  const db = await getDB()
  return db.get('settings', id)
}

export async function setSetting(settings: Settings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings)
}
