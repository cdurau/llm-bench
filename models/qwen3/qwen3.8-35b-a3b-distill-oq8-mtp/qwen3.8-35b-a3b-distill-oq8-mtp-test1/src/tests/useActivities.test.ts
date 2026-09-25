import { describe, it, expect, vi } from 'vitest';
import { useActivities } from '../hooks/useActivities';
import type { Activity } from '../types';

describe('useActivities', () => {
  function createHook(activities: Activity[] = []) {
    const onUpdate = vi.fn();
    const hook = useActivities({ activities, onUpdate });
    return { hook, onUpdate, activities };
  }

  it('adds an activity', () => {
    const { hook, onUpdate } = createHook();
    hook.addActivity({ name: 'Sport', category: 'Gesundheit' });
    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updatedData = (onUpdate.mock.calls[0] as any)[0];
    expect(updatedData.activities.length).toBe(1);
    expect(updatedData.activities.at(0)?.name).toBe('Sport');
    expect(typeof updatedData.activities.at(0)?.id).toBe('string');
    expect(updatedData.activities.at(0)?.createdAt).toBeGreaterThan(0);
  });

  it('updates an activity name', () => {
    const existing: Activity[] = [
      { id: 'a1', name: 'Kaffee', category: 'Gesundheit', createdAt: 0 },
    ];
    const { hook, onUpdate } = createHook(existing);
    hook.updateActivity('a1', { name: 'Kaffee groß' });
    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updatedData = (onUpdate.mock.calls[0] as any)[0];
    expect(updatedData.activities.at(0)?.name).toBe('Kaffee groß');
    expect(updatedData.activities.at(0)?.category).toBe('Gesundheit');
  });

  it('deletes an activity', () => {
    const existing: Activity[] = [
      { id: 'del1', name: 'Aufräumen', category: 'Haus', createdAt: 0 },
      { id: 'del2', name: 'Waschen', category: 'Haus', createdAt: 0 },
    ];
    const { hook, onUpdate } = createHook(existing);
    hook.deleteActivity('del1');
    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updatedData = (onUpdate.mock.calls[0] as any)[0];
    expect(updatedData.activities.length).toBe(1);
    expect(updatedData.activities.at(0)?.id).toBe('del2');
  });

  it('addActivity generates unique IDs across calls', () => {
    const { hook, onUpdate } = createHook();
    hook.addActivity({ name: 'A', category: 'X' });
    hook.addActivity({ name: 'B', category: 'X' });
    const idA = (onUpdate.mock.calls[0] as any)[0].activities.at(0)?.id;
    const idB = (onUpdate.mock.calls[1] as any)[0].activities.at(0)?.id;
    expect(idA).not.toBe(idB);
  });
});
