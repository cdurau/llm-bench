import { db } from './database';
import type { StreakData, Mood } from './types';

export function calculateStreaks(streaks: { completed: boolean }[]): StreakData {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = streaks.length - 1; i >= 0; i--) {
    if (streaks[i].completed) {
      currentStreak++;
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i < streaks.length - 1 && streaks[i + 1]?.completed) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

export async function getHabitStreakData(): Promise<StreakData> {
  return { current: 0, longest: 0 };
}

export async function toggleHabit(date: string): Promise<boolean> {
  const existing = await db.getStreaks(date);
  
  if (existing) {
    await db.setStreak({ ...existing, completed: !existing.completed });
    return !existing.completed;
  } else {
    await db.setStreak({ date, completed: true });
    return true;
  }
}

export async function getMood(date: string) {
  const moods = await db.getMoodsByDate(date);
  return moods.length > 0 ? moods[0] : null;
}

export async function setMood(mood: Mood, note?: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  const existing = await getMood(today);
  const moodRecord = {
    id: existing?.id || crypto.randomUUID(),
    date: today,
    mood,
    note,
    createdAt: Date.now(),
  };

  if (existing) {
    await db.updateMood(moodRecord);
  } else {
    await db.addMood(moodRecord);
  }
}
