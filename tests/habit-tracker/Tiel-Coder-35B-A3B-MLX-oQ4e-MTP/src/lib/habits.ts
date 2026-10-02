import type { Habit } from './db';

// Zurückhaltende, entsättigte Akzentfarben – pro Habit eine eigene.
export const HABIT_COLORS = [
  '#b58c6a', // Terrakotta
  '#7c8b73', // Salbei
  '#a06b6b', // Rosa
  '#6f7fa3', // Blau
  '#9a8c98', // Lavendel
  '#c2a060', // Ocker
];

export const HABIT_EMOJIS = ['💧', '📖', '🏃', '🧘', '💪', '🎯', '✍️', '🎵', '🧪', '🌱', '🧹', '💤'];

export type NewHabit = { name: string; emoji?: string; color?: string };

export function createHabit(partial: NewHabit): Habit {
  return {
    id: crypto.randomUUID(),
    name: partial.name.trim(),
    emoji: partial.emoji ?? HABIT_EMOJIS[0],
    color: partial.color ?? HABIT_COLORS[0],
    completedDates: [],
    createdAt: new Date().toISOString(),
  };
}

export const MOODS = [
  { value: 1, emoji: '😣', label: 'Sehr schlecht' },
  { value: 2, emoji: '🙁', label: 'Schlecht' },
  { value: 3, emoji: '🙂', label: 'Ordentlich' },
  { value: 4, emoji: '😊', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Sehr gut' },
];
