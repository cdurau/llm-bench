export interface HabitColor {
  key: string;
  soft: string;
  deep: string;
}

export const HABIT_COLORS: HabitColor[] = [
  { key: 'green', soft: '#EDF3EC', deep: '#346538' },
  { key: 'blue', soft: '#E1F3FE', deep: '#1F6C9F' },
  { key: 'red', soft: '#FDEBEC', deep: '#9F2F2D' },
  { key: 'yellow', soft: '#FBF3DB', deep: '#956400' },
  { key: 'violet', soft: '#F0EAF9', deep: '#6A4F9E' },
];

export const HABIT_EMOJIS = ['🧘', '🚶', '📷', '💧', '🥗', '💤', '📚', '🎨', '🏃', '🧹'];

export function habitColor(key: string): HabitColor {
  return HABIT_COLORS.find((c) => c.key === key) ?? HABIT_COLORS[0];
}