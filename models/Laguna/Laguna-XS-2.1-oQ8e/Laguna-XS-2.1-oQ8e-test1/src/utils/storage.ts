import { DATA_VERSION, type StoredData, type Activity, type DayProgress } from '../types';

const STORAGE_KEY = 'pulseboard_data';

// Hilfsfunktion für sicheren Zugriff auf localStorage
function getStoredData(): StoredData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Version prüfen und Daten validieren
    if (parsed.version !== DATA_VERSION) {
      return null; // Veraltete Daten zurücksetzen
    }
    
    // Grundlegende Struktur validieren
    if (
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.activities) ||
      typeof parsed.dayProgress !== 'object'
    ) {
      return null;
    }
    
    // Aktivitäten validieren
    const validActivities: Activity[] = [];
    for (const activity of parsed.activities) {
      if (
        typeof activity.id === 'string' &&
        typeof activity.name === 'string' &&
        typeof activity.category === 'string' &&
        typeof activity.createdAt === 'string'
      ) {
        validActivities.push(activity);
      }
    }
    
    // DayProgress validieren
    const validDayProgress: Record<string, string[]> = {};
    for (const [date, ids] of Object.entries(parsed.dayProgress)) {
      if (Array.isArray(ids) && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        validDayProgress[date] = ids.filter((id) => typeof id === 'string');
      }
    }
    
    return {
      version: DATA_VERSION,
      activities: validActivities,
      dayProgress: validDayProgress,
    };
  } catch (error) {
    console.error('Fehler beim Laden der gespeicherten Daten:', error);
    return null;
  }
}

// Standard-Daten erstellen
function createDefaultData(): StoredData {
  return {
    version: DATA_VERSION,
    activities: [],
    dayProgress: {},
  };
}

// Daten speichern
export function saveData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Fehler beim Speichern der Daten:', error);
  }
}

// Daten laden
export function loadData(): StoredData {
  const stored = getStoredData();
  return stored ?? createDefaultData();
}

// Aktivität hinzufügen
export function addActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Activity {
  const data = loadData();
  const newActivity: Activity = {
    ...activity,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.activities.push(newActivity);
  saveData(data);
  return newActivity;
}

// Aktivität aktualisieren
export function updateActivity(id: string, updates: Partial<Omit<Activity, 'id' | 'createdAt'>>): Activity | null {
  const data = loadData();
  const index = data.activities.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  const updatedActivity: Activity = {
    ...data.activities[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  data.activities[index] = updatedActivity;
  saveData(data);
  return updatedActivity;
}

// Aktivität löschen
export function deleteActivity(id: string): boolean {
  const data = loadData();
  const initialLength = data.activities.length;
  
  // Aktivität aus Liste entfernen
  data.activities = data.activities.filter(a => a.id !== id);
  
  // Alle Tagesfortschritte bereinigen
  for (const date in data.dayProgress) {
    data.dayProgress[date] = data.dayProgress[date].filter(activityId => activityId !== id);
  }
  
  if (data.activities.length !== initialLength) {
    saveData(data);
    return true;
  }
  return false;
}

// Tagesfortschritt laden
export function getDayProgress(date: string): Set<string> {
  const data = loadData();
  return new Set(data.dayProgress[date] ?? []);
}

// Tagesfortschritt speichern
export function setDayProgress(date: string, completedIds: Set<string>): void {
  const data = loadData();
  data.dayProgress[date] = Array.from(completedIds);
  saveData(data);
}

// Aktivität für einen Tag abhaken/entfernen
export function toggleActivityCompletion(date: string, activityId: string): Set<string> {
  const progress = getDayProgress(date);
  
  if (progress.has(activityId)) {
    progress.delete(activityId);
  } else {
    progress.add(activityId);
  }
  
  setDayProgress(date, progress);
  return progress;
}

// Ist Aktivität an einem Tag erledigt?
export function isActivityCompleted(date: string, activityId: string): boolean {
  const progress = getDayProgress(date);
  return progress.has(activityId);
}

// Daten löschen (zum Zurücksetzen)
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}