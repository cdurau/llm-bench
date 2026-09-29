import { initDB, type RhythmDB } from './db';
import { type Habit, type HabitLog, type MoodLog, type AppSettings } from './db';
import { calculateStreaks as calcStreaks } from './utils';

let dbPromise: Promise<RhythmDB> | null = null;

export async function getDB(): Promise<RhythmDB> {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
}

// --- Habits ---

export async function getHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.transaction('habits', 'readonly').objectStore('habits').getAll();
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('habits', 'readwrite');
  await tx.objectStore('habits').put(habit);
  await tx.done;
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['habits', 'habitLogs'], 'readwrite');
  const habitStore = tx.objectStore('habits');
  const logStore = tx.objectStore('habitLogs');
  
  await habitStore.delete(id);
  
  const logs = await logStore.getAll();
  for (const log of logs) {
    if (log.habitId === id) {
      await logStore.delete(log.id);
    }
  }
  await tx.done;
}

// --- Habit Logs ---

export async function getHabitLogs(): Promise<HabitLog[]> {
  const db = await getDB();
  return db.transaction('habitLogs', 'readonly').objectStore('habitLogs').getAll();
}

export async function toggleHabitLog(habitId: string, date: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('habitLogs', 'readwrite');
  const store = tx.objectStore('habitLogs');
  const logs = await store.getAll();
  const existingLog = logs.find(log => log.habitId === habitId && log.date === date);

  if (existingLog) {
    await store.delete(existingLog.id);
  } else {
    await store.put({
      id: `${habitId}-${date}`,
      habitId,
      date,
    });
  }
  await tx.done;
}

export async function getHabitLogsByDate(date: string): Promise<string[]> {
  const db = await getDB();
  const tx = db.transaction('habitLogs', 'readonly');
  const logs = await tx.objectStore('habitLogs').getAll();
  return logs
    .filter(log => log.date === date)
    .map(log => log.habitId);
}

// --- Mood ---

export async function getMoodLogs(): Promise<MoodLog[]> {
  const db = await getDB();
  return db.transaction('moodLogs', 'readonly').objectStore('moodLogs').getAll();
}

export async function saveMoodLog(log: MoodLog): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('moodLogs', 'readwrite');
  await tx.objectStore('moodLogs').put(log);
  await tx.done;
}

export async function getMoodLogByDate(date: string): Promise<MoodLog | undefined> {
  const db = await getDB();
  const tx = db.transaction('moodLogs', 'readonly');
  const logs = await tx.objectStore('moodLogs').getAll();
  return logs.find(log => log.date === date);
}

// --- Settings ---

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const tx = db.transaction('settings', 'readonly');
  const settings = await tx.objectStore('settings').get('user-settings');
  if (!settings || !('theme' in settings)) {
    return { id: 'user-settings', theme: 'system' };
  }
  return settings as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  await tx.objectStore('settings').put(settings);
  await tx.done;
}

// --- Utils ---

export function calculateStreaks(habitId: string, logs: HabitLog[]): { current: number; longest: number } {
  return calcStreaks(habitId, logs);
}
