import type { MoodValue } from './types';

export const MOOD_EMOJIS: Record<MoodValue, string> = {
  1: '🌧️',
  2: '☁️',
  3: '⛅',
  4: '🌤️',
  5: '☀️',
};

export const MOOD_LABELS: Record<MoodValue, string> = {
  1: 'Schlecht',
  2: 'Müde',
  3: 'Neutral',
  4: 'Gut',
  5: 'Ausgezeichnet',
};

export function moodEmoji(value: MoodValue): string {
  return MOOD_EMOJIS[value];
}

export function moodLabel(value: MoodValue): string {
  return MOOD_LABELS[value];
}
