import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor as waitForLib } from '@testing-library/react';
import { AppProvider, useApp } from './AppContext';
import { Activity } from '@/types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialisiert den Context', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    expect(result.current.appState).toBeDefined();
    expect(typeof result.current.addActivity).toBe('function');
    expect(typeof result.current.toggleActivityStatus).toBe('function');
  });

  it('kann Aktivitäten hinzufügen', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    const activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Activity',
      category: 'Work',
      description: 'Test',
      dailyTarget: 10
    };

    act(() => {
      result.current.addActivity(activity);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    // Aktivität wurde hinzugefügt
    expect(result.current.appState.activities.length).toBe(1);
  });

  it('kann Aktivitäten aktualisieren', async () => {
    // Zuerst Aktivität hinzufügen
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    // Warten bis initial state geladen ist
    await waitForLib(() => expect(result.current.appState.activities).not.toBeUndefined());

    act(() => {
      result.current.addActivity({
        name: 'Test Activity',
        category: 'Work',
        description: 'Test',
        dailyTarget: 10
      });
    });

    let activityId: string;
    await waitForLib(() => {
      activityId = result.current.appState.activities[0]?.id;
      expect(activityId).toBeDefined();
    });

    expect(activityId).toBeDefined();

    // Aktivität aktualisieren
    act(() => {
      result.current.updateActivity(activityId, { name: 'Updated Activity' });
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    await waitForLib(() => {
      expect(result.current.appState.activities[0].name).toBe('Updated Activity');
    });
  });

  it('kann Aktivitäten löschen', async () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    // Aktivität hinzufügen
    act(() => {
      result.current.addActivity({
        name: 'Test Activity',
        category: 'Work',
        description: 'Test',
        dailyTarget: 10
      });
    });

    // Warten bis Aktivität hinzugefügt wurde
    let activityId: string | undefined;
    await waitForLib(() => {
      activityId = result.current.appState.activities[0]?.id;
      expect(activityId).toBeDefined();
    });

    expect(activityId).toBeDefined();

    // Aktivität löschen
    act(() => {
      result.current.deleteActivity(activityId);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    await waitForLib(() => {
      expect(result.current.appState.activities.length).toBe(0);
    });
  });

  it('kann Datum ändern', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    act(() => {
      result.current.changeDate('2026-10-01');
    });

    expect(result.current.appState.currentViewDate).toBe('2026-10-01');
  });

  it('kann zum aktuellen Tag springen', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    act(() => {
      result.current.changeDate('2026-10-01');
    });

    act(() => {
      result.current.goToday();
    });

    const today = new Date().toISOString().split('T')[0];
    expect(result.current.appState.currentViewDate).toBe(today);
  });

  it('kann Theme umschalten', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProvider
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('pulseboard_theme', 'dark');
  });
});
