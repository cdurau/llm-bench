import { 
  AppState, 
  VersionedData, 
  STORAGE_KEY, 
  VERSIONED_DATA_VERSION
} from '@/types';

/**
 * Initialisiert die Datenstruktur mit Standardwerten
 */
export function getInitialAppState(): AppState {
  return {
    activities: [],
    dailyStatuses: [],
    currentViewDate: new Date().toISOString().split('T')[0]
  };
}

/**
 * Validiert die Version der gespeicherten Daten
 */
export function validateVersion(data: unknown): data is VersionedData {
  if (typeof data !== 'object' || data === null) return false;
  
  const versionedData = data as VersionedData;
  
  if (typeof versionedData.version !== 'number') return false;
  if (typeof versionedData.data !== 'object' || versionedData.data === null) return false;
  
  const appState = versionedData.data as AppState;
  
  if (!Array.isArray(appState.activities)) return false;
  if (!Array.isArray(appState.dailyStatuses)) return false;
  if (typeof appState.currentViewDate !== 'string') return false;
  
  // Validate activity structures
  for (const activity of appState.activities) {
    if (typeof activity.id !== 'string') return false;
    if (typeof activity.name !== 'string') return false;
    if (typeof activity.category !== 'string') return false;
    if (typeof activity.createdAt !== 'string') return false;
    
    if (activity.description !== undefined && typeof activity.description !== 'string') return false;
    if (activity.dailyTarget !== undefined && typeof activity.dailyTarget !== 'number') return false;
    if (activity.updatedAt !== undefined && typeof activity.updatedAt !== 'string') return false;
  }
  
  // Validate daily status structures
  for (const status of appState.dailyStatuses) {
    if (typeof status.activityId !== 'string') return false;
    if (typeof status.date !== 'string') return false;
    if (typeof status.completed !== 'boolean') return false;
    
    if (status.value !== undefined && typeof status.value !== 'number') return false;
    if (status.completedAt !== undefined && typeof status.completedAt !== 'string') return false;
  }
  
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(appState.currentViewDate)) return false;
  
  return true;
}

/**
 * Lädt die gespeicherten Daten mit Validierung und Fehlerbehandlung
 */
export function loadAppState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return getInitialAppState();
    }
    
    let parsed: unknown;
    try {
      parsed = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored data:', e);
      // Daten beschädigt - zurücksetzen
      return getInitialAppState();
    }
    
    if (!validateVersion(parsed)) {
      console.error('Invalid data structure or version');
      return getInitialAppState();
    }
    
    // Version kompatibel? Wenn nicht, migrieren
    if (parsed.version !== VERSIONED_DATA_VERSION) {
      console.warn(`Data version mismatch: ${parsed.version} vs ${VERSIONED_DATA_VERSION}`);
      return getInitialAppState(); // In Produktionscode würde man Migration hier einbauen
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Error loading app state:', error);
    return getInitialAppState();
  }
}

/**
 * Speichert den aktuellen AppState
 */
export function saveAppState(appState: AppState): void {
  try {
    const data: VersionedData = {
      version: VERSIONED_DATA_VERSION,
      data: appState
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving app state:', error);
    throw new Error(`Failed to save data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Löscht alle gespeicherten Daten
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Iteriert über alle Tage in einem Bereich
 */
export function getDaysInRange(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Formatierter Tagename für die UI
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Prüft, ob ein Tag in der Zukunft liegt
 */
export function isFutureDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateStr + 'T00:00:00');
  return date > today;
}

/**
 * Prüft, ob ein Tag in der Vergangenheit liegt
 */
export function isPastDate(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateStr + 'T00:00:00');
  return date < today;
}
