import type { Habit, HabitLog, MoodEntry, ThemePreference } from './types'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

declare const indexedDB: any

export const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION)
  request.onerror = () => reject(request.error)
  request.onupgradeneeded = (event: any) => {
    const db = request.result
    if (!db.objectStoreNames.contains('habits')) {
      const habitsStore = db.createObjectStore('habits', { keyPath: 'id' })
      habitsStore.createIndex('createdAt', 'createdAt')
    }
    if (!db.objectStoreNames.contains('habitLogs')) {
      const logsStore = db.createObjectStore('habitLogs', { keyPath: 'id' })
      logsStore.createIndex('habitId', 'habitId')
      logsStore.createIndex('date', 'date')
    }
    if (!db.objectStoreNames.contains('moods')) {
      const moodsStore = db.createObjectStore('moods', { keyPath: 'id' })
      moodsStore.createIndex('date', 'date')
    }
    if (!db.objectStoreNames.contains('settings')) {
      const settingsStore = db.createObjectStore('settings', { keyPath: 'id' })
      settingsStore.put({ id: 'theme', darkMode: false })
    }
  }
  request.onsuccess = () => resolve(request.result)
})

export async function getHabits(): Promise<Habit[]> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habits', 'readonly')
    const store = tx.objectStore('habits')
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function addHabit(habit: Omit<Habit, 'id' | 'streak' | 'maxStreak' | 'createdAt'>): Promise<string> {
  const id = crypto.randomUUID()
  const newHabit: Habit = {
    ...habit,
    id,
    streak: 0,
    maxStreak: 0,
    createdAt: new Date().toISOString(),
  }
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habits', 'readwrite')
    const store = tx.objectStore('habits')
    const request = store.put(newHabit)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(id)
  })
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habits', 'readwrite')
    const store = tx.objectStore('habits')
    const request = store.put(habit)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habits', 'readwrite')
    const store = tx.objectStore('habits')
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getHabitLogsByDate(date: string): Promise<HabitLog[]> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habitLogs', 'readonly')
    const store = tx.objectStore('habitLogs')
    const request = store.index('date').getAll(IDBKeyRange.only(date))
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function logHabitCompleted(habitId: string, completed: boolean): Promise<void> {
  const date = formatDate(new Date())
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habitLogs', 'readwrite')
    const store = tx.objectStore('habitLogs')
    
    // Check if entry exists for this date and habit
    const request = store.index('date').getAll(IDBKeyRange.only(date))
    request.onerror = () => reject(request.error)
    request.onsuccess = async () => {
      const existing = request.result.find((log: any) => log.habitId === habitId)
      if (existing) {
        await new Promise<void>((resolve, reject) => {
          const updateReq = store.put({ ...existing, completed })
          updateReq.onerror = () => reject(updateReq.error)
          updateReq.onsuccess = () => resolve()
        })
      } else {
        await new Promise<void>((resolve, reject) => {
          const request = store.put({
            id: crypto.randomUUID(),
            habitId,
            completed,
            date,
          })
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve()
        })
      }
      
      // Update streak
      await updateStreak(habitId, completed)
      resolve()
    }
  })
}

async function updateStreak(habitId: string, completed: boolean): Promise<void> {
  const habits = await getHabits()
  const habit = habits.find((h) => h.id === habitId)
  if (!habit) return

  const logs = await getHabitLogsByDate(formatDate(new Date()))
  
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  const yesterdayLogs = await getHabitLogsByDate(yesterday)
  const yesterdayCompleted = yesterdayLogs.some((log) => log.habitId === habitId && log.completed)
  
  let streak = habit.streak
  if (completed) {
    if (yesterdayCompleted || streak === 0) {
      streak += 1
    } else {
      streak = 1
    }
  } else {
    streak = 0
  }

  const maxStreak = Math.max(habit.maxStreak, streak)

  await updateHabit({ ...habit, streak, maxStreak })
}

export async function getMoodForDate(date: string): Promise<MoodEntry | undefined> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('moods', 'readonly')
    const store = tx.objectStore('moods')
    const request = store.index('date').getAll(IDBKeyRange.only(date))
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result[0])
  })
}

export async function setMood(value: 1 | 2 | 3 | 4 | 5, note?: string): Promise<void> {
  const date = formatDate(new Date())
  const existing = await getMoodForDate(date)
  
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('moods', 'readwrite')
    const store = tx.objectStore('moods')
    
    if (existing) {
      const request = store.put({ ...existing, value, note })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    } else {
      const request = store.put({
        id: crypto.randomUUID(),
        date,
        value,
        note,
        createdAt: new Date().toISOString(),
      })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    }
  })
}

export async function clearMoodForDate(date: string): Promise<void> {
  const existing = await getMoodForDate(date)
  if (existing) {
    const db = await dbPromise
    return new Promise((resolve, reject) => {
      const tx = db.transaction('moods', 'readwrite')
      const store = tx.objectStore('moods')
      const request = store.delete(existing.id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export async function getThemePreference(): Promise<ThemePreference> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly')
    const store = tx.objectStore('settings')
    const request = store.get('theme')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result ?? { darkMode: false })
  })
}

export async function setThemePreference(darkMode: boolean): Promise<void> {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite')
    const store = tx.objectStore('settings')
    const request = store.put({ id: 'theme', darkMode })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getWeekDates(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}
