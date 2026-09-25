import { describe, expect, it } from 'vitest'
import { addDays, dateToKey, keyToDate, formatDayLabel, isFuture, isToday, todayKey } from './date'

describe('date helpers', () => {
  it('formattelt lokale Datums in YYYY-MM-DD', () => {
    expect(dateToKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(dateToKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('wandelt Ketten zurück in Dates', () => {
    const d = keyToDate('2026-01-05')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(5)
  })

  it('addiert und subtrahiert Tage', () => {
    expect(addDays('2026-01-05', 1)).toBe('2026-01-06')
    expect(addDays('2026-01-05', -1)).toBe('2026-01-04')
    expect(addDays('2026-01-01', 30)).toBe('2026-01-31')
  })

  it('erkennt Zukunft und heute', () => {
    const today = '2026-09-24'
    expect(isFuture('2026-09-25', today)).toBe(true)
    expect(isFuture('2026-09-23', today)).toBe(false)
    expect(isFuture('2026-09-24', today)).toBe(false)
    expect(isToday('2026-09-24', today)).toBe(true)
    expect(isToday('2026-09-25', today)).toBe(false)
  })

  it('liefert relative Labels', () => {
    const today = '2026-09-24'
    expect(formatDayLabel('2026-09-24', today)).toBe('Heute')
    expect(formatDayLabel('2026-09-23', today)).toBe('Gestern')
    expect(formatDayLabel('2026-09-25', today)).toBe('Morgen')
    expect(formatDayLabel('2026-09-28', today)).toMatch(/September/)
  })

  it('todayKey nutzt das übergebene Datum', () => {
    expect(todayKey(new Date(2026, 8, 24))).toBe('2026-09-24')
  })
})
