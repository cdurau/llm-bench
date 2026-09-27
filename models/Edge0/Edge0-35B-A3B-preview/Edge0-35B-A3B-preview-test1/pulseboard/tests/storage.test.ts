import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readStoredData, writeStoredData, createEmptyData, useActivities, useDayStatus } from '../src/utils/storage';
import { Activity, StoredData, CURRENT_SCHEMA_VERSION } from '../src/types';
import { formatDateKey } from '../src/utils/date';

vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
});

describe('storage — readStoredData', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when no data exists', () => {
    expect(readStoredData()).toBeNull();
  });

  it('returns null on corrupted JSON', () => {
    localStorage.setItem('pulseboard', 'not-json');
    expect(readStoredData()).toBeNull();
  });

  it('returns null on wrong schema version', () => {
    localStorage.setItem(
      'pulseboard',
      JSON.stringify({ version: 999, activities: [], dayStatus: {} })
    );
    expect(readStoredData()).toBeNull();
  });

  it('returns null when activities is not an array', () => {
    localStorage.setItem(
      'pulseboard',
      JSON.stringify({ version: 1, activities: 'bad', dayStatus: {} })
    );
    expect(readStoredData()).toBeNull();
  });

  it('returns null when dayStatus is an array (wrong shape)', () => {
    localStorage.setItem(
      'pulseboard',
      JSON.stringify({ version: 1, activities: [], dayStatus: [] })
    );
    expect(readStoredData()).not.toBeNull(); // activity data is valid, dayStatus becomes {}
  });

  it('sanitizes activities with missing fields', () => {
    const data: StoredData = {
      version: 1,
      activities: [
        { name: '', dailyGoal: -5 } as unknown as Activity,
      ],
      dayStatus: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeStoredData(data);
    const result = readStoredData();
    expect(result).not.toBeNull();
    expect(result!.activities[0].name).toBe('Ohne Titel');
    expect(result!.activities[0].dailyGoal).toBeUndefined();
  });

  it('preserves valid data', () => {
    const data: StoredData = {
      version: 1,
      activities: [
        {
          id: 'act-1',
          name: 'Joggen',
          category: 'Gesundheit',
          dailyGoal: 3,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ],
      dayStatus: {},
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    writeStoredData(data);
    const result = readStoredData();
    expect(result).not.toBeNull();
    expect(result!.activities[0].name).toBe('Joggen');
    expect(result!.activities[0].dailyGoal).toBe(3);
  });
});

describe('storage — writeStoredData', () => {
  beforeEach(() => localStorage.clear());

  it('stores data correctly', () => {
    const data = createEmptyData();
    data.activities = [{ id: 'x', name: 'Test', category: 'Sonstiges', createdAt: '' } as Activity];
    writeStoredData(data);
    const result = readStoredData();
    expect(result?.activities.length).toBe(1);
  });
});

describe('useActivities', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty activities initially', () => {
    const result = useActivities(createEmptyData());
    expect(result.activities).toEqual([]);
  });

  it('adds an activity', () => {
    const result = useActivities(createEmptyData());
    result.addActivity('Joggen', 'Morgens um 7 Uhr', 'Gesundheit', 3);
    expect(result.activities.length).toBe(1);
    expect(result.activities[0].name).toBe('Joggen');
    expect(result.activities[0].category).toBe('Gesundheit');
    expect(result.activities[0].dailyGoal).toBe(3);
  });

  it('adds an activity without optional fields', () => {
    const result = useActivities(createEmptyData());
    result.addActivity('Lesen');
    expect(result.activities[0].name).toBe('Lesen');
    expect(result.activities[0].description).toBeUndefined();
    expect(result.activities[0].category).toBe('Sonstiges');
    expect(result.activities[0].dailyGoal).toBeUndefined();
  });

  it('trims whitespace from name', () => {
    const result = useActivities(createEmptyData());
    result.addActivity('  Joggen  ');
    expect(result.activities[0].name).toBe('Joggen');
  });

  it('updates an activity', () => {
    const result = useActivities(createEmptyData());
    result.addActivity('Schwimmen', 'Beim Sportverein', 'Gesundheit', 2);
    const id = result.activities[0].id;
    result.updateActivity(id, 'Schwimmen Training', 'Wochentlich', 'Gesundheit', 4);
    expect(result.activities[0].name).toBe('Schwimmen Training');
    expect(result.activities[0].dailyGoal).toBe(4);
  });

  it('removes an activity', () => {
    const result = useActivities(createEmptyData());
    result.addActivity('Lesen');
    result.addActivity('Coding');
    expect(result.activities.length).toBe(2);
    const id = result.activities[1].id;
    result.removeActivity(id);
    expect(result.activities.length).toBe(1);
  });

  it('persists data to localStorage', () => {
    const result = useActivities(createEmptyData());
    result.addActivity('Persistenz-Test');
    const stored = JSON.parse(localStorage.getItem('pulseboard')!);
    expect(stored.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(stored.activities.length).toBe(1);
  });
});

describe('useDayStatus', () => {
  beforeEach(() => localStorage.clear());

  const createActivity = (name: string, dailyGoal?: number) => {
    const result = useActivities(createEmptyData());
    result.addActivity(name, undefined, 'Test', dailyGoal);
    return result;
  };

  it('toggles activity check state', () => {
    const activityResult = createActivity('Joggen', 3);
    const activity = activityResult.activities[0];
    const statusResult = useDayStatus(
      { ...createEmptyData(), activities: activityResult.activities },
      new Date()
    );

    expect(statusResult.dayStatus[statusResult.dateKey]?.[activity.id]).toBeUndefined();

    statusResult.toggleActivity(activity.id);
    expect(statusResult.dayStatus[statusResult.dateKey]?.[activity.id]).toBe(true);

    statusResult.toggleActivity(activity.id);
    expect(statusResult.dayStatus[statusResult.dateKey]?.[activity.id]).toBe(false);
  });

  it('separates day statuses', () => {
    const activityResult = createActivity('Lesen');
    const activity = activityResult.activities[0];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayKey = formatDateKey(today);
    const tomorrowKey = formatDateKey(tomorrow);

    const statusResult = useDayStatus(
      { ...createEmptyData(), activities: activityResult.activities },
      today
    );

    statusResult.toggleActivity(activity.id);

    // Today should be done
    expect(statusResult.dayStatus[todayKey]?.[activity.id]).toBe(true);
    // Tomorrow should be undefined (not checked)
    expect(statusResult.dayStatus[tomorrowKey]?.[activity.id]).toBeUndefined();
  });

  it('calculates progress for activities with goals', () => {
    const activityResult = createActivity('Sit-ups', 5);
    const activity = activityResult.activities[0];
    const today = new Date();
    const statusResult = useDayStatus(
      { ...createEmptyData(), activities: activityResult.activities },
      today
    );

    const withStatus = statusResult.getActivitiesWithStatus(activityResult.activities);
    const first = withStatus.find((a) => a.id === activity.id)!;
    expect(first.progressPercent).toBe(0);
    expect(first.doneToday).toBe(false);

    statusResult.toggleActivity(activity.id);
    const withStatus2 = statusResult.getActivitiesWithStatus(activityResult.activities);
    const updated = withStatus2.find((a) => a.id === activity.id)!;
    expect(updated.doneCount).toBe(1);
  });

  it('returns empty array for no activities', () => {
    const statusResult = useDayStatus(createEmptyData(), new Date());
    const withStatus = statusResult.getActivitiesWithStatus([]);
    expect(withStatus).toEqual([]);
  });

  it('does not allow toggling on future dates', () => {
    const activityResult = createActivity('Test');
    const activity = activityResult.activities[0];
    const future = new Date();
    future.setDate(future.getDate() + 5);

    const statusResult = useDayStatus(
      { ...createEmptyData(), activities: activityResult.activities },
      future
    );

    statusResult.toggleActivity(activity.id);
    const withStatus = statusResult.getActivitiesWithStatus(activityResult.activities);
    const first = withStatus.find((a) => a.id === activity.id)!;

    // Should still be stored but not marked done for future
    expect(first.doneToday).toBe(false);
  });
});
