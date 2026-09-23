import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getInitialAppState, 
  validateVersion, 
  loadAppState, 
  saveAppState, 
  clearStorage,
  formatDisplayDate,
  isFutureDate,
  isPastDate
} from './storage';
import { AppState, VersionedData, VERSIONED_DATA_VERSION, STORAGE_KEY } from '@/types';

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

describe('storage utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInitialAppState', () => {
    it('gibt initialen AppState zurück', () => {
      const state = getInitialAppState();
      expect(state.activities).toEqual([]);
      expect(state.dailyStatuses).toEqual([]);
      expect(state.currentViewDate).toBeDefined();
    });

    it('hat heute als Standarddatum', () => {
      const state = getInitialAppState();
      const today = new Date().toISOString().split('T')[0];
      expect(state.currentViewDate).toBe(today);
    });
  });

  describe('validateVersion', () => {
    it('validiert korrekte Datenstruktur', () => {
      const data: VersionedData = {
        version: VERSIONED_DATA_VERSION,
        data: getInitialAppState()
      };
      expect(validateVersion(data)).toBe(true);
    });

    it('validiert falsche Datenstruktur', () => {
      const data = {
        version: VERSIONED_DATA_VERSION,
        data: {
          activities: 'not an array',
          dailyStatuses: [],
          currentViewDate: '2026-09-23'
        }
      };
      expect(validateVersion(data)).toBe(false);
    });

    it('validiert fehlende Felder', () => {
      const data = {
        version: VERSIONED_DATA_VERSION,
        data: {
          activities: [],
          dailyStatuses: []
          // currentViewDate fehlt
        }
      };
      expect(validateVersion(data)).toBe(false);
    });
  });

  describe('loadAppState', () => {
    it('gibt initialen AppState zurück wenn nichts gespeichert ist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const state = loadAppState();
      expect(state.activities).toEqual([]);
    });

    it('gibt gespeicherte Daten zurück', () => {
      const state: AppState = {
        activities: [{ id: '1', name: 'Test', category: 'Work', createdAt: new Date().toISOString() }],
        dailyStatuses: [],
        currentViewDate: '2026-09-23'
      };
      const data: VersionedData = {
        version: VERSIONED_DATA_VERSION,
        data: state
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
      
      const loaded = loadAppState();
      expect(loaded.activities.length).toBe(1);
    });

    it('gibt initialen AppState zurück bei beschädigten Daten', () => {
      localStorageMock.getItem.mockReturnValue('not json');
      const state = loadAppState();
      expect(state.activities).toEqual([]);
    });
  });

  describe('saveAppState', () => {
    it('speichert AppState mit Version', () => {
      const state: AppState = getInitialAppState();
      saveAppState(state);
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const call = localStorageMock.setItem.mock.calls[0];
      const savedData = JSON.parse(call[1]);
      expect(savedData.version).toBe(VERSIONED_DATA_VERSION);
    });
  });

  describe('clearStorage', () => {
    it('löscht Storage', () => {
      clearStorage();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('formatDisplayDate', () => {
    it('formatiert ein Datum', () => {
      const formatted = formatDisplayDate('2026-09-23');
      expect(formatted).toContain('2026');
    });

    it('gibt Originalstring zurück bei ungültigem Datum', () => {
      expect(formatDisplayDate('invalid')).toBe('invalid');
    });
  });

  describe('isFutureDate', () => {
    it('erkent Zukunft', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(isFutureDate(tomorrowStr)).toBe(true);
    });

    it('erkent Vergangenheit', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(isFutureDate(yesterdayStr)).toBe(false);
    });

    it('erkent heute nicht als Zukunft', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isFutureDate(today)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('erkent Vergangenheit', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      expect(isPastDate(yesterdayStr)).toBe(true);
    });

    it('erkent Zukunft nicht als Vergangenheit', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(isPastDate(tomorrowStr)).toBe(false);
    });

    it('erkent heute nicht als Vergangenheit', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isPastDate(today)).toBe(false);
    });
  });
});
