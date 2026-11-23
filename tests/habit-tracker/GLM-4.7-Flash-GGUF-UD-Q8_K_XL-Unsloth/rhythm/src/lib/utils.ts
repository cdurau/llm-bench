export const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Sehr schlecht' },
  { value: 2, emoji: '😕', label: 'Schlecht' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Sehr gut' }
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];

export function getMoodEmoji(value: MoodValue): string {
  const mood = MOOD_OPTIONS.find(m => m.value === value);
  return mood?.emoji || '😐';
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDisplayDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', { 
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });
}

export function formatWeekday(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', { weekday: 'short' });
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function isToday(date: string): boolean {
  return isSameDay(formatDate(new Date()), date);
}

export function getDaysSince(date: number): number {
  const now = new Date();
  const d = new Date(date);
  const diffTime = Math.abs(now.getTime() - d.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
