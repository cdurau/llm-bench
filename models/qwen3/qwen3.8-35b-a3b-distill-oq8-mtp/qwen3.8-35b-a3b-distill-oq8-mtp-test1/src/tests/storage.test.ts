import { describe, it, expect } from 'vitest';
import {
  load,
  save,
  freshData,
  markComplete,
  addActivity,
  updateActivity,
  removeActivity,
  getIsComplete,
  isFutureDate,
  formatGermanDate,
  getToday,
  getYesterday,
  getTomorrow,
} from '../lib/storage';
import type { AppData } from '../types';

function setStored(data: AppData): void {
  localStorage.setItem('pulseboard:data:v1', JSON.stringify(data));
}

describe('load / save / freshData', () => {
  it('returns freshData when localStorage is empty', () => {
    const result = load();
    expect(result.version).toBe(1);
    expect(result.activities).toEqual([]);
    expect(result.completions).toEqual([]);
  });

  it('parses valid stored data', () => {
    const data: AppData = {
      version: 1,
      activities: [{
        id: 'a1',
        name: 'Sport',
        category: 'Gesundheit',
        createdAt: 1000,
      }],
      completions: [],
    };
    setStored(data);
    const result = load();
    expect(result.activities.length).toBe(1);
    expect(result.activities.at(0)?.name).toBe('Sport');
  });

  it('returns freshData on corrupt JSON', () => {
    localStorage.setItem('pulseboard:data:v1', 'not json {{{');
    const result = load();
    expect(result.version).toBe(1);
    expect(result.activities).toEqual([]);
  });

  it('returns freshData when data object is malformed', () => {
    setStored({} as AppData);
    const result = load();
    expect(result.version).toBe(1);
  });

  it('returns freshData when version is missing', () => {
    setStored({ activities: [], completions: [] } as unknown as AppData);
    const result = load();
    expect(result.version).toBe(1);
  });

  it('save / load roundtrip preserves data', () => {
    const data: AppData = {
      version: 1,
      activities: [{
        id: 'x1',
        name: 'Lesen',
        category: 'Bildung',
        createdAt: 5000,
      }],
      completions: [{ date: '2099-01-01', completions: { x1: true } }],
    };
    save(data);
    const loaded = load();
    expect(loaded.activities.at(0)?.name).toBe('Lesen');
    expect(loaded.completions.at(0)?.completions.x1).toBe(true);
  });
});

describe('markComplete', () => {
  it('marks an activity as complete and creates a record', () => {
    const data = addActivity(freshData(), {
      id: 'act1',
      name: 'Yoga',
      category: 'Gesundheit',
      createdAt: 0,
    });
    const result = markComplete(data, '2025-06-15', 'act1', true);
    expect(getIsComplete(result, '2025-06-15', 'act1')).toBe(true);
  });

  it('unmarks an activity', () => {
    const withCompletion = addActivity(freshData(), {
      id: 'act2',
      name: 'Laufen',
      category: 'Gesundheit',
      createdAt: 0,
    });
    const marked = markComplete(withCompletion, '2025-07-20', 'act2', true);
    const unmarked = markComplete(marked, '2025-07-20', 'act2', false);
    expect(getIsComplete(unmarked, '2025-07-20', 'act2')).toBe(false);
  });

  it('does not affect other dates', () => {
    const data = addActivity(freshData(), { id: 'a', name: 'Test', category: 'X', createdAt: 0 });
    const d1 = markComplete(data, '2025-01-01', 'a', true);
    const d2 = markComplete(data, '2025-02-02', 'a', false);
    expect(getIsComplete(d1, '2025-01-01', 'a')).toBe(true);
    expect(getIsComplete(d2, '2025-02-02', 'a')).toBe(false);
  });
});

describe('add / update / remove activity', () => {
  it('adds an activity', () => {
    const data = addActivity(freshData(), {
      id: 'n1',
      name: 'Kochen',
      category: 'Persönlich',
      createdAt: 100,
    });
    expect(data.activities.length).toBe(1);
    expect(data.activities.at(0)?.name).toBe('Kochen');
  });

  it('updates an activity', () => {
    const data = addActivity(freshData(), {
      id: 'n2',
      name: 'Kaffee',
      category: 'Gesundheit',
      createdAt: 0,
    });
    const updated = updateActivity(data, 'n2', { name: 'Kaffee groß' });
    expect(updated.activities.at(0)?.name).toBe('Kaffee groß');
    expect(updated.activities.at(0)?.category).toBe('Gesundheit');
  });

  it('removes an activity and cleans completions', () => {
    const data = addActivity(freshData(), {
      id: 'n3',
      name: 'Wasser',
      category: 'Gesundheit',
      createdAt: 0,
    });
    const completed = markComplete(data, '2025-03-01', 'n3', true);
    const removed = removeActivity(completed, 'n3');
    expect(removed.activities.length).toBe(0);
    expect(removed.completions.length).toBe(0);
  });
});

describe('date utilities', () => {
  it('formatGermanDate returns DE formatted string', () => {
    expect(formatGermanDate('2026-09-25')).toBe('Fr., 25. September 2026');
  });

  it('getYesterday returns correct ISO date', () => {
    expect(getYesterday('2026-09-26')).toBe('2026-09-25');
  });

  it('getTomorrow returns correct ISO date', () => {
    expect(getTomorrow('2026-09-25')).toBe('2026-09-26');
  });

  it('getTomorrow crosses month boundary', () => {
    expect(getTomorrow('2026-02-28')).toBe('2026-03-01');
  });

  it('getYesterday crosses year boundary', () => {
    expect(getYesterday('2027-01-01')).toBe('2026-12-31');
  });

  it('isFutureDate returns false for dates before today', () => {
    const today = getToday();
    expect(isFutureDate(today)).toBe(false);
    expect(isFutureDate(getYesterday(today))).toBe(false);
  });

  it('isFutureDate returns true for dates after today', () => {
    const today = getToday();
    expect(isFutureDate(getTomorrow(today))).toBe(true);
  });
});
