import type { HabitColorKey } from './types';

export interface HabitColorSpec {
  label: string;
  swatch: string; // dot / ring accent
  light: { bg: string; text: string; solid: string };
  dark: { bg: string; text: string; solid: string };
}

export const HABIT_COLORS: Record<HabitColorKey, HabitColorSpec> = {
  terracotta: {
    label: 'Terracotta',
    swatch: '#c05b3a',
    light: { bg: '#f6e3dc', text: '#7a3b2b', solid: '#c05b3a' },
    dark: { bg: '#3a2620', text: '#f0b095', solid: '#e08a63' }
  },
  sage: {
    label: 'Salbei',
    swatch: '#5f7f4f',
    light: { bg: '#e6ede0', text: '#3c5833', solid: '#5f7f4f' },
    dark: { bg: '#25301f', text: '#bfd8a8', solid: '#9cc084' }
  },
  ochre: {
    label: 'Ocker',
    swatch: '#c2912f',
    light: { bg: '#f6eed3', text: '#7a5b14', solid: '#c2912f' },
    dark: { bg: '#342b15', text: '#eed08a', solid: '#e0b45a' }
  },
  dusty: {
    label: 'Blaugrau',
    swatch: '#3f6e93',
    light: { bg: '#e1eaf0', text: '#2c4e6b', solid: '#3f6e93' },
    dark: { bg: '#1f2b37', text: '#a9c4dc', solid: '#74a6c9' }
  },
  plum: {
    label: 'Pflaume',
    swatch: '#7b4e8a',
    light: { bg: '#ede3ee', text: '#5c3a66', solid: '#7b4e8a' },
    dark: { bg: '#2b2030', text: '#d6b9e2', solid: '#b285cb' }
  },
  teal: {
    label: 'Teal',
    swatch: '#2e7e6e',
    light: { bg: '#e0eeea', text: '#1f5a50', solid: '#2e7e6e' },
    dark: { bg: '#18302c', text: '#9cd0c4', solid: '#5fb5a3' }
  },
  rose: {
    label: 'Rosé',
    swatch: '#c05b6a',
    light: { bg: '#f6e1e4', text: '#7e3340', solid: '#c05b6a' },
    dark: { bg: '#331f24', text: '#ebb4ba', solid: '#d97f8e' }
  },
  sand: {
    label: 'Sand',
    swatch: '#9c7c3e',
    light: { bg: '#eee7d4', text: '#6c5724', solid: '#9c7c3e' },
    dark: { bg: '#2e281b', text: '#e0cd9f', solid: '#cfb46b' }
  }
};

export const HABIT_COLOR_KEYS = Object.keys(HABIT_COLORS) as HabitColorKey[];

export const HABIT_EMOJIS = [
  '🏃', '💧', '🧘', '📖', '💪', '🥗', '😴', '🧹', '🎸', '✍️',
  '🚶', '🌱', '🎯', '🏋️', '🧠', '🍎', '💊', '🌅', '☕', '🚭'
];

export function getHabitColor(key: HabitColorKey) {
  return HABIT_COLORS[key] ?? HABIT_COLORS.terracotta;
}

/** CSS custom properties for the per-habit chip (consumed by .habit-chip classes). */
export function habitChipVars(color: HabitColorKey): Record<string, string> {
  const spec = getHabitColor(color);
  return {
    '--chip-bg': spec.light.bg,
    '--chip-text': spec.light.text,
    '--chip-solid': spec.light.solid,
    '--chip-bg-dark': spec.dark.bg,
    '--chip-text-dark': spec.dark.text,
    '--chip-solid-dark': spec.dark.solid
  };
}
