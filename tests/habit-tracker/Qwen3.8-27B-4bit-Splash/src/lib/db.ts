// Datenschicht: IndexedDB über „idb“. Kein Backend – alles bleibt lokal.

import { openDB, type IDBPDatabase } from 'idb'

export type HabitColorKey = 'sage' | 'clay' | 'blue' | 'lavender' | 'sand' | 'rose'

export type MoodValue = 1 | 2 | 3 | 4 | 5

export interface Habit {
  id: string
  name: string
  emoji: string
  color: HabitColorKey
  createdAt: number
}

/** Ein Haken: Habit × Tag (Komposit-Index verhindert Doppelhaken). */
export interface Completion {
  habitId: string
  date: string
}

/** Eine Stimmung pro Tag (Schlüssel: Tag) plus optionaler Kurznotiz. */
export interface MoodEntry {
  date: string
  value: MoodValue
  note: string
}

const DB_NAME = 'rhythm'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('habits', { keyPath: 'id' })

      const completions = db.createObjectStore('completions', {
        keyPath: ['habitId', 'date'],
      })
      completions.createIndex('byHabit', 'habitId')

      db.createObjectStore('moods', { keyPath: 'date' })
    },
  })
  return dbPromise
}

// ---------- Habits ----------

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB()
  return (await db.getAll('habits')) as Habit[]
}

export async function putHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

/** Löscht den Habit samt aller Haken. */
export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['habits', 'completions'], 'readwrite')
  const rows = (await tx.objectStore('completions').index('byHabit').getAll(id)) as Completion[]
  await Promise.all(
    rows.map((row) =>
      tx.objectStore('completions').delete([row.habitId, row.date] as [string, string]),
    ),
  )
  await tx.objectStore('habits').delete(id)
  await tx.done
}

// ---------- Haken ----------

export async function getAllCompletions(): Promise<Completion[]> {
  const db = await getDB()
  return (await db.getAll('completions')) as unknown as Completion[]
}

export async function putCompletion(completion: Completion): Promise<void> {
  const db = await getDB()
  await db.put('completions', completion)
}

export async function removeCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDB()
  await db.delete('completions', [habitId, date] as [string, string])
}

// ---------- Stimmung ----------

export async function getAllMoods(): Promise<MoodEntry[]> {
  const db = await getDB()
  return (await db.getAll('moods')) as MoodEntry[]
}

export async function putMood(entry: MoodEntry): Promise<void> {
  const db = await getDB()
  await db.put('moods', entry)
}

export async function removeMood(date: string): Promise<void> {
  const db = await getDB()
  await db.delete('moods', date)
}

// ---------- Wartung ----------

/** Leert alle drei Stores. */
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['habits', 'completions', 'moods'], 'readwrite')
  await Promise.all([
    tx.objectStore('habits').clear(),
    tx.objectStore('completions').clear(),
    tx.objectStore('moods').clear(),
  ])
  await tx.done
}
