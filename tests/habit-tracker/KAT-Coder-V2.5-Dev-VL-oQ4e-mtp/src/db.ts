import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface HabitLog {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  completed: boolean
}

export interface MoodLog {
  id: string
  date: string // YYYY-MM-DD
  mood: number // 1-5
  note?: string
}

let _db: IDBPDatabase | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('habits')) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' })
        habitStore.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains('habitLogs')) {
        const logStore = db.createObjectStore('habitLogs', { keyPath: 'id' })
        logStore.createIndex('habitId', 'habitId')
        logStore.createIndex('date', 'date')
      }
      if (!db.objectStoreNames.contains('moodLogs')) {
        const moodStore = db.createObjectStore('moodLogs', { keyPath: 'id' })
        moodStore.createIndex('date', 'date')
      }
    }
  })
  return _db
}

// Habits
export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB()
  return db.getAllFromIndex('habits', 'createdAt')
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('habits', id)
  const logs = await db.getAllFromIndex('habitLogs', 'habitId', id)
  const tx = db.transaction('habitLogs', 'readwrite')
  for (const log of logs) await tx.store.delete(log.id)
  await tx.done
}

// Habit logs
export async function getLogForDate(habitId: string, date: string): Promise<HabitLog | null> {
  const db = await getDB()
  const logs = await db.getAllFromIndex('habitLogs', 'date', date)
  return logs.find(l => l.habitId === habitId) ?? null
}

export async function getAllLogsForDate(date: string): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('habitLogs', 'date', date)
}

export async function saveHabitLog(log: HabitLog): Promise<void> {
  const db = await getDB()
  await db.put('habitLogs', log)
}

// Mood logs
export async function getMoodForDate(date: string): Promise<MoodLog | null> {
  const db = await getDB()
  const logs = await db.getAllFromIndex('moodLogs', 'date', date)
  return logs[0] ?? null
}

export async function saveMoodLog(log: MoodLog): Promise<void> {
  const db = await getDB()
  await db.put('moodLogs', log)
}

export async function getAllMoodLogs(): Promise<MoodLog[]> {
  const db = await getDB()
  return db.getAll('moodLogs')
}

// Stats helpers
export function getStreak(habits: Habit[], logs: HabitLog[]): Record<string, { current: number; longest: number }> {
  const result: Record<string, { current: number; longest: number }> = {}

  for (const habit of habits) {
    const completedDates = [...new Set(
      logs.filter(l => l.habitId === habit.id && l.completed).map(l => l.date)
    )].sort()

    if (completedDates.length === 0) {
      result[habit.id] = { current: 0, longest: 0 }
      continue
    }

    // Current streak: consecutive days ending today or yesterday
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0]

    let current = 0
    if (completedDates.includes(todayStr)) {
      current = 1
      let d = new Date(today.getTime() - 86400000)
      while (true) {
        const ds = d.toISOString().split('T')[0]
        if (completedDates.includes(ds)) {
          current++
          d = new Date(d.getTime() - 86400000)
        } else {
          break
        }
      }
    } else if (completedDates.includes(yesterday)) {
      current = 1
      let d = new Date(today.getTime() - 86400000 * 2)
      while (true) {
        const ds = d.toISOString().split('T')[0]
        if (completedDates.includes(ds)) {
          current++
          d = new Date(d.getTime() - 86400000)
        } else {
          break
        }
      }
    }

    // Longest streak
    let longest = 0
    let run = 1
    for (let i = 1; i < completedDates.length; i++) {
      const prev = new Date(new Date(completedDates[i - 1]).getTime() - 86400000).toISOString().split('T')[0]
      if (completedDates[i] === prev) {
        run++
      } else {
        longest = Math.max(longest, run)
        run = 1
      }
    }
    longest = Math.max(longest, run)

    result[habit.id] = { current, longest }
  }

  return result
}
