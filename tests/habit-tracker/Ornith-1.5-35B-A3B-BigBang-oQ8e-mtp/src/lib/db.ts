import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Habit, MoodEntry } from "../types"

export interface CompletionRecord {
  key: string
  habitId: string
  date: string
}

interface RhythmDB extends DBSchema {
  habits: { key: string; value: Habit }
  completions: {
    key: string
    value: CompletionRecord
    indexes: { habitId: string }
  }
  moods: { key: string; value: MoodEntry }
}

let dbPromise: Promise<IDBPDatabase<RhythmDB>> | null = null

export function getDB(): Promise<IDBPDatabase<RhythmDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RhythmDB>("rhythm", 1, {
      upgrade(db) {
        db.createObjectStore("habits", { keyPath: "id" })
        const completions = db.createObjectStore("completions", { keyPath: "key" })
        completions.createIndex("habitId", "habitId")
        db.createObjectStore("moods", { keyPath: "date" })
      },
    })
  }
  return dbPromise
}

function completionKey(habitId: string, date: string): string {
  return `${habitId}::${date}`
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDB()
  return db.getAll("habits")
}

export async function upsertHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put("habits", habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("habits", id)
  const completions = await db.getAllFromIndex("completions", "habitId", id)
  for (const c of completions) {
    await db.delete("completions", c.key)
  }
}

export async function completeHabit(habitId: string, date: string): Promise<void> {
  const db = await getDB()
  await db.put("completions", { habitId, date, key: completionKey(habitId, date) })
}

export async function uncompleteHabit(habitId: string, date: string): Promise<void> {
  const db = await getDB()
  await db.delete("completions", completionKey(habitId, date))
}

export async function getCompletions(): Promise<CompletionRecord[]> {
  const db = await getDB()
  return db.getAll("completions")
}

export async function getMoods(): Promise<MoodEntry[]> {
  const db = await getDB()
  return db.getAll("moods")
}

export async function saveMood(entry: MoodEntry): Promise<void> {
  const db = await getDB()
  await db.put("moods", entry)
}

export async function clearAll(): Promise<void> {
  const db = await getDB()
  await db.clear("habits")
  await db.clear("completions")
  await db.clear("moods")
}
