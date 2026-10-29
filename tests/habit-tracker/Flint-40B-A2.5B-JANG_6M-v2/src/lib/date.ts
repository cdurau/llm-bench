const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function lastNDays(count: number): Date[] {
  const result: Date[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    result.push(addDays(new Date(), -i));
  }
  return result;
}

const fullFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(d: Date = new Date()): string {
  return fullFormatter.format(d);
}

export function weekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()] ?? 'So';
}

export function moodLabel(value: number): string {
  switch (value) {
    case 1:
      return 'Schlecht';
    case 2:
      return 'Eher schlecht';
    case 3:
      return 'Okay';
    case 4:
      return 'Gut';
    case 5:
      return 'Sehr gut';
    default:
      return '';
  }
}