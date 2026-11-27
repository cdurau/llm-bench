import { openDB, type IDBPDatabase } from 'idb';
import type { Habit, Completion, MoodEntry } from './types';

const DB_NAME = 'rhythm';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('completions')) {
          db.createObjectStore('completions', { keyPath: ['habitId', 'date'] });
        }
        if (!db.objectStoreNames.contains('moods')) {
          db.createObjectStore('moods', { keyPath: 'date' });
        }
      }
    });
  }
  return dbPromise;
}

export async function loadHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAll('habits');
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  await db.put('habits', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['habits', 'completions'], 'readwrite');
  await tx.objectStore('habits').delete(id);
  let cursor = await tx.objectStore('completions').openCursor();
  while (cursor) {
    if (cursor.value.habitId === id) await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function loadCompletions(): Promise<Completion[]> {
  const db = await getDB();
  return db.getAll('completions');
}

export async function putCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDB();
  await db.put('completions', { habitId, date, completedAt: Date.now() });
}

export async function deleteCompletion(habitId: string, date: string): Promise<void> {
  const db = await getDB();
  await db.delete('completions', [habitId, date]);
}

export async function loadMoods(): Promise<MoodEntry[]> {
  const db = await getDB();
  return db.getAll('moods');
}

export async function saveMood(entry: MoodEntry): Promise<void> {
  const db = await getDB();
  await db.put('moods', entry);
}

export async function deleteMood(date: string): Promise<void> {
  const db = await getDB();
  await db.delete('moods', date);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('habits');
  await db.clear('completions');
  await db.clear('moods');
}

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const [habits, completions, moods] = await Promise.all([
    db.getAll('habits'),
    db.getAll('completions'),
    db.getAll('moods')
  ]);
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), habits, completions, moods }, null, 2);
}
