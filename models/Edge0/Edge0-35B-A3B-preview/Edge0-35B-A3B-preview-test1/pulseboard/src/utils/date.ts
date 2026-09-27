export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const parts = key.split('-');
  const y = parts[0] ? parseInt(parts[0], 10) : 0;
  const m = parts[1] ? parseInt(parts[1], 10) : 0;
  const d = parts[2] ? parseInt(parts[2], 10) : 0;
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (formatDateKey(date) === formatDateKey(today)) return 'Heute';
  if (formatDateKey(date) === formatDateKey(yesterday)) return 'Gestern';
  if (formatDateKey(date) === formatDateKey(tomorrow)) return 'Morgen';

  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
