import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'rhythm-db';
const DB_VERSION = 1;

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  note?: string;
}

export interface ThemePreference {
  key: string;
  theme: 'light' | 'dark' | 'system';
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('completions')) {
          const store = db.createObjectStore('completions', { keyPath: 'id' });
          store.createIndex('habitId', 'habitId');
          store.createIndex('date', 'date');
        }
        if (!db.objectStoreNames.contains('moods')) {
          db.createObjectStore('moods', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// Habits
export async function getHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAll('habits');
}

export async function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
  const db = await getDB();
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await db.put('habits', newHabit);
  return newHabit;
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  await db.put('habits', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('habits', id);
}

// Completions
export async function getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
  const db = await getDB();
  return db.getAllFromIndex('completions', 'date', date);
}

export async function getCompletionsForHabit(habitId: string): Promise<HabitCompletion[]> {
  const db = await getDB();
  return db.getAllFromIndex('completions', 'habitId', habitId);
}

export async function toggleCompletion(habitId: string, date: string): Promise<boolean> {
  const db = await getDB();
  const completions = await getCompletionsForDate(date);
  const existing = completions.find((c) => c.habitId === habitId);

  if (existing) {
    await db.delete('completions', existing.id);
    return false;
  } else {
    await db.put('completions', { id: crypto.randomUUID(), habitId, date });
    return true;
  }
}

export async function isCompleted(habitId: string, date: string): Promise<boolean> {
  const completions = await getCompletionsForDate(date);
  return completions.some((c) => c.habitId === habitId);
}

// Moods
export async function getMoodForDate(date: string): Promise<MoodEntry | null> {
  const db = await getDB();
  return db.get('moods', date);
}

export async function setMood(entry: MoodEntry): Promise<void> {
  const db = await getDB();
  await db.put('moods', entry);
}

export async function getMoodsForWeek(startDate: string): Promise<MoodEntry[]> {
  const db = await getDB();
  const allMoods = await db.getAll('moods');
  return allMoods.filter((m: MoodEntry) => m.date >= startDate);
}

// Settings
export async function getThemePreference(): Promise<ThemePreference> {
  const db = await getDB();
  const setting = await db.get('settings', 'theme');
  return setting ?? { key: 'theme', theme: 'system' };
}

export async function setThemePreference(theme: ThemePreference): Promise<void> {
  const db = await getDB();
  await db.put('settings', theme);
}
