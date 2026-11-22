import { openDB } from 'idb';

export const DB_NAME = 'rhythm-db';
export const DB_VERSION = 1;

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: number;
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  note?: string;
  createdAt: number;
}

export type MoodValue = number;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Habits store
    if (!db.objectStoreNames.contains('habits')) {
      const habitsStore = db.createObjectStore('habits', { keyPath: 'id' });
      habitsStore.createIndex('createdAt', 'createdAt');
    }

    // Completions store
    if (!db.objectStoreNames.contains('completions')) {
      const completionsStore = db.createObjectStore('completions', { keyPath: 'id' });
      completionsStore.createIndex('habitId', 'habitId');
      completionsStore.createIndex('date', 'date');
    }

    // Mood entries store
    if (!db.objectStoreNames.contains('moodEntries')) {
      const moodStore = db.createObjectStore('moodEntries', { keyPath: 'id' });
      moodStore.createIndex('date', 'date');
    }
  },
});

export async function addHabit(habit: Omit<Habit, 'id'>): Promise<void> {
  const db = await dbPromise;
  const id = crypto.randomUUID();
  await db.put('habits', { ...habit, id });
}

export async function getHabits(): Promise<Habit[]> {
  const db = await dbPromise;
  return db.getAllFromIndex('habits', 'createdAt');
}

export async function updateHabit(id: string, updates: Partial<Omit<Habit, 'id'>>): Promise<void> {
  const db = await dbPromise;
  const habit = await db.get('habits', id);
  if (habit) {
    await db.put('habits', { ...habit, ...updates });
  }
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete('habits', id);
  // Also delete associated completions
  const completions = await db.getAllFromIndex('completions', 'habitId', id);
  for (const completion of completions) {
    await db.delete('completions', completion.id);
  }
}

export async function addCompletion(completion: Omit<Completion, 'id'>): Promise<void> {
  const db = await dbPromise;
  const id = crypto.randomUUID();
  await db.put('completions', { ...completion, id });
}

export async function getCompletionsForDate(date: string): Promise<Completion[]> {
  const db = await dbPromise;
  return db.getAllFromIndex('completions', 'date', date);
}

export async function getCompletionsForHabit(habitId: string, startDate?: string, endDate?: string): Promise<Completion[]> {
  const db = await dbPromise;
  let completions = await db.getAllFromIndex('completions', 'habitId', habitId);
  
  if (startDate) {
    completions = completions.filter(c => c.date >= startDate);
  }
  if (endDate) {
    completions = completions.filter(c => c.date <= endDate);
  }
  
  return completions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function deleteCompletion(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete('completions', id);
}

export async function addMoodEntry(entry: Omit<MoodEntry, 'id'>): Promise<void> {
  const db = await dbPromise;
  const id = crypto.randomUUID();
  await db.put('moodEntries', { ...entry, id });
}

export async function getMoodEntryForDate(date: string): Promise<MoodEntry | undefined> {
  const db = await dbPromise;
  return db.getFromIndex('moodEntries', 'date', date);
}

export async function deleteMoodEntry(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete('moodEntries', id);
}

export async function getMoodEntriesForDateRange(startDate: string, endDate: string): Promise<MoodEntry[]> {
  const db = await dbPromise;
  const entries = await db.getAllFromIndex('moodEntries', 'date');
  return entries
    .filter(e => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
