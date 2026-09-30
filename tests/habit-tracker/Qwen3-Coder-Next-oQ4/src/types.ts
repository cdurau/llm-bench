export type Mood = 1 | 2 | 3 | 4 | 5;
export type Color = 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'indigo' | 'violet' | 'pink';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: Color;
  createdAt: number;
}

export interface StreakRecord {
  date: string;
  completed: boolean;
}

export interface MoodRecord {
  id: string;
  date: string;
  mood: Mood;
  note?: string;
  createdAt: number;
}

export interface AppState {
  habits: Habit[];
  moodRecords: MoodRecord[];
  darkMode: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
}
