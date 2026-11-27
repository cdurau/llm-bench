export interface MoodDef {
  value: number;
  emoji: string;
  label: string;
}

export const MOODS: MoodDef[] = [
  { value: 1, emoji: '😞', label: 'Schlecht' },
  { value: 2, emoji: '😕', label: 'Nicht gut' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Ausgezeichnet' }
];

export function moodLabel(value: number | undefined | null): string {
  if (value == null) return '';
  return MOODS.find((m) => m.value === value)?.label ?? '';
}

export function moodEmoji(value: number | undefined | null): string {
  if (value == null) return '';
  return MOODS.find((m) => m.value === value)?.emoji ?? '';
}
