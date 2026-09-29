import { initDB, type RhythmDB } from './db';
import { type Habit, type HabitLog, type MoodLog, type AppSettings } from './db';
import { calculateStreaks as calcStreaks } from './utils';

let db: RhythmDB | null = null;

export async function getDB(): Promise<RhythmDB> {
  if (!db) {
    db = await initDB();
  }
  return db;
}

// --- Habits ---

export async function getHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.habits.getAll();
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  await db.habits.put(habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.habits.delete(id);
  // Also delete logs for this habit
  const logs = await db.habitLogs.getAll();
  for (const log of logs) {
    if (log.habitId === id) {
      await db.habitLogs.delete(log.id);
    }
  }
}

// --- Habit Logs ---

export async function getHabitLogs(): Promise<HabitLog[]> {
  const db = await getDB();
  return db.habitLogs.getAll();
}

export async function toggleHabitLog(habitId: string, date: string): Promise<void> {
  const db = await getDB();
  const logs = await db.habitLogs.getAll();
  const existingLog = logs.find(log => log.habitId === habitId && log.date === date);

  if (existingLog) {
    await db.habitLogs.delete(existingLog.id);
  } else {
    await db.habitLogs.put({
      id: `${habitId}-${date}`,
      habitId,
      date,
    });
  }
}

export async function getHabitLogsByDate(date: string): Promise<string[]> {
  const db = await getDB();
  const logs = await db.habitLogs.getAll();
  return logs
    .filter(log => log.date === date)
    .map(log => log.habitId);
}

// --- Mood ---

export async function getMoodLogs(): Promise<MoodLog[]> {
  const db = await getDB();
  return db.moodLogs.getAll();
}

export async function saveMoodLog(log: MoodLog): Promise<void> {
  const db = await getDB();
  await db.moodLogs.put(log);
}

export async function getMoodLogByDate(date: string): Promise<MoodLog | undefined> {
  const db = await getDB();
  const logs = await db.moodLogs.getAll();
  return logs.find(log => log.date === date);
}

// --- Settings ---

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.settings.get('user-settings');
  return settings || { id: 'user-settings', darkMode: false };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.settings.put({ id: 'user-settings', ...settings });
}

// --- Utils ---

export function calculateStreaks(habitId: string, logs: HabitLog[]): { current: number; longest: number } {
  return calcStreaks(habitId, logs);
}
