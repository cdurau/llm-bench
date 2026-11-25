// --- Shared types for Rhythm ---

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD local
}

export interface MoodEntry {
  date: string;
  value: number; // 1–5
  note: string;
}

export type DarkModePreference = 'light' | 'dark' | 'system';

export const HABIT_COLORS = [
  '#C9A26E', '#B5654E', '#4E7D6F', '#5E6B8A', '#8A6B7A', '#6B8A5E'
] as const;

export const EMOJI_OPTIONS = [
  '🏃', '📚', '🧘', '✍️', '💧', '🥗', '😴', '🎵',
  '🧠', '🚴', '💪', '🌱', '🎨', '💻', '🧹', '🗣️',
  '📵', '🪥', '🧑‍🤝‍🧑', '🌿'
] as const;

export type MoodEmoji = '😣' | '😕' | '😐' | '🙂' | '😄';

export const MOOD_MAP: Record<MoodEmoji, number> = {
  '😣': 1,
  '😕': 2,
  '😐': 3,
  '🙂': 4,
  '😄': 5,
};

export const MOOD_EMOJIS: MoodEmoji[] = ['😣', '😕', '😐', '🙂', '😄'];
