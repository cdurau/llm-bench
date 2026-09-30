import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getColorClasses(color: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
  };

  return colors[color] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };
}

export function getMoodEmoji(mood: number): string {
  const moods = ['', '😡', '😟', '😐', '🙂', '🥰'];
  return moods[mood] || '😐';
}
