import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDayData } from '../hooks/useDayData';
import { freshData, addActivity, markComplete, getToday } from '../lib/storage';
import type { AppData } from '../types';

function makeDate(dateStr: string) {
  return {
    selectedDate: dateStr,
    selectedCategory: null,
    tab: 'aktivitäten' as const,
    onDateChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onTabChange: vi.fn(),
  };
}

function makeHook(data: AppData, dateStr: string = '2025-06-15') {
  return renderHook(() =>
    useDayData(data, makeDate(dateStr))
  );
}

describe('useDayData - isToday', () => {
  it('isToday is true when selectedDate equals today', () => {
    const today = getToday();
    const hook = renderHook(() =>
      useDayData(freshData(), makeDate(today))
    );
    expect(hook.result.current.isToday).toBe(true);
  });

  it('isToday is false for arbitrary dates', () => {
    const hook = makeHook(freshData(), '2025-01-01');
    expect(hook.result.current.isToday).toBe(false);
  });
});

describe('useDayData - activities', () => {
  it('returns empty activities when none exist', () => {
    const { result } = makeHook(freshData());
    expect(result.current.activities).toEqual([]);
  });

  it('returns activities with completion status', () => {
    const data = addActivity(freshData(), {
      id: 'x',
      name: 'Spazieren',
      category: 'Freizeit',
      createdAt: 0,
    });
    const marked = markComplete(data, '2025-06-15', 'x', true);
    const { result } = makeHook(marked, '2025-06-15');
    expect(result.current.activities.length).toBe(1);
    expect(result.current.activities.at(0)?.isComplete).toBe(true);
  });

  it('unmarked activities show isComplete false', () => {
    const data = addActivity(freshData(), {
      id: 'y',
      name: 'Lesen',
      category: 'Bildung',
      createdAt: 0,
    });
    const { result } = makeHook(data);
    expect(result.current.activities.at(0)?.isComplete).toBe(false);
  });
});

describe('useDayData - completion toggle', () => {
  it('toggleComplete returns updated AppData', () => {
    const data = addActivity(freshData(), {
      id: 't1',
      name: 'Meditation',
      category: 'Persönlich',
      createdAt: 0,
    });
    const { result } = makeHook(data);
    const updated = result.current.toggleComplete('t1', true);
    expect(updated.version).toBe(1);
    const { result: r2 } = makeHook(updated, '2025-06-15');
    expect(
      r2.current.activities.at(0)?.activity.id
    ).toBe('t1');
    expect(
      r2.current.activities.at(0)?.isComplete
    ).toBe(true);
  });

  it('toggleComplete toggles true → false', () => {
    const data = addActivity(freshData(), {
      id: 't2',
      name: 'Hausaufgaben',
      category: 'Bildung',
      createdAt: 0,
    });
    const marked = markComplete(data, '2025-06-15', 't2', true);
    const { result } = makeHook(marked, '2025-06-15');
    const unmarked = result.current.toggleComplete('t2', false);
    const { result: r2 } = makeHook(unmarked, '2025-06-15');
    expect(
      r2.current.activities.at(0)?.isComplete
    ).toBe(false);
  });
});

describe('useDayData - delete', () => {
  it('deleteActivity removes the activity from list', () => {
    const data = addActivity(freshData(), {
      id: 'del1',
      name: 'Aufräumen',
      category: 'Haus',
      createdAt: 0,
    });
    const { result } = makeHook(data);
    const updated = result.current.deleteActivity('del1');
    expect(updated.activities.length).toBe(0);
  });

  it('deleteActivity cleans completions', () => {
    const data = addActivity(freshData(), {
      id: 'del2',
      name: 'Waschen',
      category: 'Haus',
      createdAt: 0,
    });
    const marked = markComplete(data, '2025-06-15', 'del2', true);
    const { result } = makeHook(marked);
    const updated = result.current.deleteActivity('del2');
    expect(updated.completions.length).toBe(0);
  });
});

describe('useDayData - stats', () => {
  it('computes correct stats', () => {
    const data = addActivity(freshData(), { id: 's1', name: 'A', category: 'K', createdAt: 0 });
    const data2 = addActivity(data, { id: 's2', name: 'B', category: 'K', createdAt: 0 });
    const data3 = addActivity(data2, { id: 's3', name: 'C', category: 'K', createdAt: 0 });
    const done = markComplete(data3, '2025-06-15', 's1', true);
    const done2 = markComplete(done, '2025-06-15', 's2', true);
    const { result } = makeHook(done2);
    expect(result.current.stats.completed).toBe(2);
    expect(result.current.stats.open).toBe(1);
    expect(result.current.stats.percentage).toBe(67);
  });

  it('stats are 0 when no activities exist', () => {
    const { result } = makeHook(freshData());
    expect(result.current.stats.completed).toBe(0);
    expect(result.current.stats.open).toBe(0);
    expect(result.current.stats.percentage).toBe(0);
  });
});

describe('useDayData - category stats', () => {
  it('computes category breakdown', () => {
    const data = addActivity(freshData(), { id: 'c1', name: 'A', category: 'Sport', createdAt: 0 });
    const data2 = addActivity(data, { id: 'c2', name: 'B', category: 'Sport', createdAt: 0 });
    const data3 = addActivity(data2, { id: 'c3', name: 'C', category: 'Arbeit', createdAt: 0 });
    const done = markComplete(data3, '2025-06-15', 'c1', true);
    const { result } = makeHook(done);
    expect(result.current.categoryStats.length).toBe(2);
  });
});

describe('useDayData - completion isolation', () => {
  it('a different date has different completion state', () => {
    const data = addActivity(freshData(), { id: 'iso1', name: 'Test', category: 'X', createdAt: 0 });
    const withCompletion = markComplete(data, '2024-12-31', 'iso1', true);
    const hook = makeHook(withCompletion);
    expect(hook.result.current.activities.at(0)?.isComplete).toBe(false);
  });
});
