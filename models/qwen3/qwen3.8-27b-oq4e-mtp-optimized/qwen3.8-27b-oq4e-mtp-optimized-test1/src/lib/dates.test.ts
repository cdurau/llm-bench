import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatLong,
  formatShort,
  fromKey,
  isFuture,
  isToday,
  isValidKey,
  toKey,
  todayKey,
} from './dates';
import { setClock } from './clock';

describe('dates', () => {
  it('toKey/formatLong-Loop: Datum → Key → Datum', () => {
    const date = new Date(2026, 8, 27); // 27. September 2026
    expect(toKey(date)).toBe('2026-09-27');
    const back = fromKey('2026-09-27');
    expect(back).not.toBeNull();
    expect(toKey(back as Date)).toBe('2026-09-27');
  });

  it('ruft zweistellige Monate/Tage korrekt auf', () => {
    expect(toKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toKey(new Date(2025, 11, 31))).toBe('2025-12-31');
  });

  it('isValidKey akzeptiert nur echte Kalendertage', () => {
    expect(isValidKey('2026-09-27')).toBe(true);
    expect(isValidKey('2024-02-29')).toBe(true); // Schaltjahr
    expect(isValidKey('2026-02-29')).toBe(false);
    expect(isValidKey('2026-00-10')).toBe(false);
    expect(isValidKey('2026-13-01')).toBe(false);
    expect(isValidKey('27.09.2026')).toBe(false);
    expect(isValidKey('')).toBe(false);
  });

  it('addDays arbeitet über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-09-27', 1)).toBe('2026-09-28');
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-03-31', 1)).toBe('2026-04-01');
  });

  it('isFuture/isToday mit festgelegter Uhr', () => {
    setClock(new Date(2026, 8, 27, 12));
    expect(isToday('2026-09-27')).toBe(true);
    expect(isToday('2026-09-26')).toBe(false);
    expect(isFuture('2026-09-28')).toBe(true);
    expect(isFuture('2026-09-27')).toBe(false);
    expect(isFuture('2026-09-26')).toBe(false);
    expect(todayKey()).toBe('2026-09-27');
  });

  it('formatiert Datum deutsch', () => {
    // 27. September 2026 ist ein Sonntag.
    expect(formatLong('2026-09-27')).toBe('Sonntag, 27. September');
    expect(formatShort('2026-09-27')).toMatch(/27\.\s*Sep/);
  });
});
