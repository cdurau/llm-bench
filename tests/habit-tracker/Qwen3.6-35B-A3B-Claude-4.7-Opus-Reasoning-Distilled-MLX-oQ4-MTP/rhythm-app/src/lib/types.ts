export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type MoodEmoji =
  | '🌧️'
  | '☁️'
  | '⛅'
  | '🌤️'
  | '☀️';

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface HabitCheck {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodValue;
  note: string;
}

export type DarkMode = 'system' | 'light' | 'dark';
