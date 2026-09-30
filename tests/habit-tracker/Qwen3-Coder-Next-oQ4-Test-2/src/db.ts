// db.ts – IndexedDB über idb für Habit & Stimmungs-Tracker
import { openDB } from 'idb'

const DB_NAME = 'rhythm-db'
const DB_VERSION = 1

// Typen
export type Mood = {
  id: string
  date: string // ISO Date string (YYYY-MM-DD)
  value: number // 1-5
  note?: string
  timestamp: number
}

export type Habit = {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export type HabitStatus = {
  id: string
  habitId: string
  date: string
  completed: boolean
  timestamp: number
}

export type Theme = 'light' | 'dark' | 'system'
export type SystemTheme = 'light' | 'dark'

// Initialer Stimmungs-Emoji-Satz
export const MOOD_EMOJIS = ['😡', '😢', '😐', '🙂', '😄']
export const MOOD_COLORS = ['#9F2F2D', '#1F6C9F', '#956400', '#346538', '#2F3437']

// Hole heute's Date string
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]
}

// Hole gestrigen Date string
export const getYesterdayString = (): string => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

//Öffne DB
export const openRhythmDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Habits Store
      if (!db.objectStoreNames.contains('habits')) {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const habitsStore = db.createObjectStore('habits', { keyPath: 'id' })
        habitsStore.createIndex('createdAt', 'createdAt')
      }

      // HabitStatus Store
      if (!db.objectStoreNames.contains('habitStatus')) {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const statusStore = db.createObjectStore('habitStatus', { keyPath: 'id' })
        statusStore.createIndex('habitId_date', ['habitId', 'date'])
        statusStore.createIndex('date', 'date')
      }

      // Moods Store
      if (!db.objectStoreNames.contains('moods')) {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const moodsStore = db.createObjectStore('moods', { keyPath: 'id' })
        moodsStore.createIndex('date', 'date')
      }

      // Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
  })
}

// Helper: UUID generieren
export const generateId = (): string => {
  return crypto.randomUUID()
}

// Settings
export const getTheme = async (): Promise<Theme> => {
  try {
    const db = await openRhythmDB()
    const value = await db.get('settings', 'theme')
    return value?.value || 'system'
  } catch {
    return 'system'
  }
}

export const setTheme = async (theme: Theme) => {
  const db = await openRhythmDB()
  await db.put('settings', { key: 'theme', value: theme })
}

export const getSystemTheme = (): SystemTheme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Habits
export const getAllHabits = async (): Promise<Habit[]> => {
  const db = await openRhythmDB()
  return await db.getAll('habits')
}

export const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>): Promise<string> => {
  const db = await openRhythmDB()
  const id = generateId()
  const newHabit = { ...habit, id, createdAt: Date.now() }
  await db.add('habits', newHabit)
  return id
}

export const updateHabit = async (habit: Habit): Promise<void> => {
  const db = await openRhythmDB()
  await db.put('habits', habit)
}

export const deleteHabit = async (id: string): Promise<void> => {
  const db = await openRhythmDB()
  await db.delete('habits', id)
  // Also delete status entries
  const status = await db.getAll('habitStatus')
  const toDelete = status.filter(s => s.habitId === id).map(s => s.id)
  for (const id of toDelete) {
    await db.delete('habitStatus', id)
  }
}

// Habit Status
export const getHabitStatus = async (habitId: string, date: string): Promise<HabitStatus | undefined> => {
  const db = await openRhythmDB()
  const tx = db.transaction('habitStatus', 'readonly')
  const store = tx.objectStore('habitStatus')
  const index = store.index('habitId_date')
  const key = [habitId, date]
  const value = await index.get(key)
  return value
}

export const setHabitStatus = async (habitId: string, date: string, completed: boolean): Promise<void> => {
  const db = await openRhythmDB()
  const existing = await getHabitStatus(habitId, date)
  
  if (existing) {
    await db.put('habitStatus', {
      ...existing,
      completed,
      timestamp: Date.now()
    })
  } else {
    await db.add('habitStatus', {
      id: generateId(),
      habitId,
      date,
      completed,
      timestamp: Date.now()
    })
  }
}

// Streaks berechnen
export const calculateStreaks = async (habitId: string): Promise<{ current: number }> => {
  const db = await openRhythmDB()
  const status = await db.getAll('habitStatus')
  
  const habitStatuses = status
    .filter(s => s.habitId === habitId && s.completed)
    .map(s => s.date)
    .sort()
  
  if (habitStatuses.length === 0) return { current: 0 }
  
  let current = 0
  let streak = 0
  const today = getTodayString()
  const yesterday = getYesterdayString()
  
  // Aktuelle Serie berechnen (ab heute oder gestern rückwärts)
  const todayIndex = habitStatuses.indexOf(today)
  const yesterdayIndex = habitStatuses.indexOf(yesterday)
  
  if (todayIndex !== -1 || yesterdayIndex !== -1) {
    // Wir sind in einer aktiven Serie
    let checkDate = today
    if (todayIndex === -1) checkDate = yesterday
    
    while (true) {
      if (habitStatuses.includes(checkDate)) {
        streak++
        const date = new Date(checkDate)
        date.setDate(date.getDate() - 1)
        checkDate = date.toISOString().split('T')[0]
      } else {
        break
      }
    }
    current = streak
  }
  
  return { current }
}

// Moods
export const getMoodForDate = async (date: string): Promise<Mood | undefined> => {
  const db = await openRhythmDB()
  return await db.get('moods', date)
}

export const setMood = async (date: string, value: number, note?: string): Promise<void> => {
  const db = await openRhythmDB()
  const existing = await db.get('moods', date)
  
  if (existing) {
    await db.put('moods', {
      ...existing,
      value,
      note,
      timestamp: Date.now()
    })
  } else {
    await db.add('moods', {
      id: date,
      date,
      value,
      note,
      timestamp: Date.now()
    })
  }
}

export const getMoodHistory = async (days: number): Promise<Mood[]> => {
  const db = await openRhythmDB()
  const allMoods = await db.getAll('moods')
  
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  
  return allMoods
    .filter(m => new Date(m.date) >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Heute's Habits mit Status
export const getTodayHabits = async (): Promise<(Habit & { completed: boolean })[]> => {
  const db = await openRhythmDB()
  const habits = await db.getAll('habits')
  
  const results: (Habit & { completed: boolean })[] = []
  
  for (const habit of habits) {
    const status = await getHabitStatus(habit.id, getTodayString())
    results.push({
      ...habit,
      completed: status?.completed || false
    })
  }
  
  return results
}

// Woche's Daten für Chart
export const getWeekData = async (): Promise<{ date: string; completed: number; mood: number | null }[]> => {
  const db = await openRhythmDB()
  const weekData: { [key: string]: { completed: number; mood: number | null } } = {}
  
  // Letzte 7 Tage initialisieren
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    weekData[dateStr] = { completed: 0, mood: null }
  }
  
  // Status für alle Habits der letzten 7 Tage zählen
  const status = await db.getAll('habitStatus')
  for (const s of status) {
    if (weekData[s.date] !== undefined && s.completed) {
      weekData[s.date].completed++
    }
  }
  
  // Moods für die letzten 7 Tage laden
  const moods = await db.getAll('moods')
  for (const m of moods) {
    if (weekData[m.date] !== undefined) {
      weekData[m.date].mood = m.value
    }
  }
  
  return Object.entries(weekData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
