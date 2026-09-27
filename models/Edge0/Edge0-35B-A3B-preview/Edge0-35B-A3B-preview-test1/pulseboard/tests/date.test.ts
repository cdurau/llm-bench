import { describe, it, expect } from 'vitest';
import { formatDateKey, parseDateKey, formatDisplayDate } from '../src/utils/date';

describe('date utils', () => {
  describe('formatDateKey', () => {
    it('formats date to ISO key', () => {
      expect(formatDateKey(new Date(2025, 0, 15))).toBe('2025-01-15');
    });

    it('handles leading zeros correctly', () => {
      expect(formatDateKey(new Date(2025, 0, 1))).toBe('2025-01-01');
      expect(formatDateKey(new Date(2025, 11, 10))).toBe('2025-12-10');
    });
  });

  describe('parseDateKey', () => {
    it('parses date key correctly', () => {
      const date = parseDateKey('2025-01-15');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });
  });

  describe('formatDisplayDate', () => {
    it('shows "Heute" for today', () => {
      const today = new Date();
      expect(formatDisplayDate(today)).toBe('Heute');
    });

    it('shows "Gestern" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDisplayDate(yesterday)).toBe('Gestern');
    });

    it('shows "Morgen" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatDisplayDate(tomorrow)).toBe('Morgen');
    });

    it('shows full date for other days', () => {
      const date = new Date(2025, 5, 20);
      const display = formatDisplayDate(date);
      expect(display).toContain('2025');
      expect(display).toContain('Juni');
    });
  });
});
