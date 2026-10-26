import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Habit, Completion, Mood, AppSettings } from './types'

export const DB_NAME = 'rhythm-db'
export const DB_VERSION = 1

export interface RhythmDB extends DBSchema {
  habits: {
    key: string
    value: Habit
  }
  completions: {
    key: string
    value: Completion
  }
  moods: {
    key: string
    value: Mood
  }
  settings: {
    key: string
    value: AppSettings
  }
}

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null

export function getDB(): Promise<IDBPDatabase<RhythmDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('habits', { keyPath: 'id' })

        const completions = db.createObjectStore('completions', { keyPath: 'id' })
        completions.createIndex('habitId', 'habitId')
        completions.createIndex('day', 'day')

        db.createObjectStore('moods', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}
