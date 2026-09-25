/**
 * Reiner Speicher/Logik-Fabrik für PulseBoard (ohne React).
 *
 * Die Fabrik hält den Zustand im Speicher, schreibt nach jeder Änderung persist
 * ins Backend und benachrichtigt Subscriber. Dadurch lässt sich die gesamte
 * Geschäftslogik (Erstellen/Bearbeiten/Löschen, Tagesstatus, Datumswechsel,
 * Persistenz, umgehen mit beschädigten Daten) ohne Framework testen.
 */

import { addDays, isFuture, todayKey } from '../lib/date'
import {
  clearStored,
  readStored,
  StorageBackend,
  defaultBackend,
  validateActivity,
  writeStored,
} from '../lib/storage'
import type { Activity, ActivityInput, Completions, NewActivityInput, StorageData } from '../types'
import { STORAGE_KEY } from '../types'

export interface AppState {
  data: StorageData
  selectedDate: string
}

export interface Store {
  getState(): AppState
  subscribe(listener: () => void): () => void
  setSelectedDate(date: string): void
  addActivity(input: NewActivityInput): Activity | null
  editActivity(id: string, input: ActivityInput): boolean
  deleteActivity(id: string): void
  toggleComplete(activityId: string, date: string): void
  reload(): void
  reset(): void
}

export interface StoreFactoryOptions {
  backend?: StorageBackend
  now?: () => Date
}

interface Internal {
  state: AppState
  backend: StorageBackend
  now: () => Date
  listeners: Set<() => void>
}

function computeNow(internal: Internal): string {
  return todayKey(internal.now())
}

function persist(internal: Internal): void {
  writeStored(internal.state.data, internal.backend)
}

function emit(internal: Internal): void {
  for (const listener of internal.listeners) {
    listener()
  }
}

export function createStore(options: StoreFactoryOptions = {}): Store {
  const backend = options.backend ?? defaultBackend
  const now = options.now ?? (() => new Date())
  const todayStr = todayKey(now())
  const internal: Internal = {
    state: { data: readStored(backend), selectedDate: todayStr },
    backend,
    now,
    listeners: new Set(),
  }

  function setState(next: Partial<AppState>): void {
    internal.state = { ...internal.state, ...next }
    persist(internal)
    emit(internal)
  }

  return {
    getState() {
      return internal.state
    },

    subscribe(listener) {
      internal.listeners.add(listener)
      return () => {
        internal.listeners.delete(listener)
      }
    },

    setSelectedDate(date) {
      setState({ selectedDate: date })
    },

    addActivity(input) {
      const result = validateActivity(input, {})
      if (!result.ok) {
        return null
      }
      const activity = result.activity
      internal.state.data.activities[activity.id] = activity
      persist(internal)
      emit(internal)
      return activity
    },

    editActivity(id, input) {
      const existing = internal.state.data.activities[id]
      if (!existing) {
        return false
      }
      const result = validateActivity(input, { id, createdAt: existing.createdAt })
      if (!result.ok) {
        return false
      }
      internal.state.data.activities[id] = result.activity
      persist(internal)
      emit(internal)
      return true
    },

    deleteActivity(id) {
      if (!internal.state.data.activities[id]) {
        return
      }
      delete internal.state.data.activities[id]
      // Verwaigte Zählstände entfernen.
      for (const dateKeys of Object.values(internal.state.data.completions)) {
        delete dateKeys[id]
      }
      persist(internal)
      emit(internal)
    },

    toggleComplete(activityId, date) {
      const activity = internal.state.data.activities[activityId]
      if (!activity) {
        return
      }
      // Zukünftige Tage dürfen nicht als erledigt markiert werden.
      if (isFuture(date, computeNow(internal))) {
        return
      }
      const target = Math.max(0, activity.dailyTarget)
      const current = internal.state.data.completions[date]?.[activityId] ?? 0

      let next: number
      if (target > 0) {
        next = current < target ? current + 1 : current - 1
      } else {
        next = current > 0 ? 0 : 1
      }

      const dayCompletions = internal.state.data.completions[date] ?? {}
      if (next <= 0) {
        delete dayCompletions[activityId]
        if (Object.keys(dayCompletions).length === 0) {
          delete internal.state.data.completions[date]
        }
      } else {
        dayCompletions[activityId] = next
        internal.state.data.completions[date] = dayCompletions
      }
      persist(internal)
      emit(internal)
    },

    reload() {
      internal.state = { data: readStored(internal.backend), selectedDate: computeNow(internal) }
      persist(internal)
      emit(internal)
    },

    reset() {
      clearStored(internal.backend)
      internal.state = { data: readStored(internal.backend), selectedDate: computeNow(internal) }
      emit(internal)
    },
  }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen für die Ansicht
// ---------------------------------------------------------------------------

/** Anzahl erledigter Einträge einer Aktivität an einem Tag. */
export function getCompletedCount(
  data: StorageData,
  activityId: string,
  date: string,
): number {
  return data.completions[date]?.[activityId] ?? 0
}

/** Ist eine Aktivität an einem Tag als (voll) erledigt? */
export function isCompleted(data: StorageData, activity: Activity, date: string): boolean {
  const count = getCompletedCount(data, activity.id, date)
  if (activity.dailyTarget > 0) {
    return count >= activity.dailyTarget
  }
  return count > 0
}

export interface CategoryStat {
  name: string
  total: number
  completed: number
}

export interface DayStats {
  total: number
  completed: number
  open: number
  percent: number
  byCategory: CategoryStat[]
}

/** Berechnet die Dashboard-Statistik für einen Tag. */
export function computeStats(data: StorageData, date: string): DayStats {
  const activities = Object.values(data.activities)
  const total = activities.length
  let completed = 0
  const byCategoryMap = new Map<string, { total: number; completed: number }>()

  for (const activity of activities) {
    const done = isCompleted(data, activity, date)
    if (done) {
      completed += 1
    }
    const cat = activity.category || 'Ohne Kategorie'
    const entry = byCategoryMap.get(cat) ?? { total: 0, completed: 0 }
    entry.total += 1
    if (done) {
      entry.completed += 1
    }
    byCategoryMap.set(cat, entry)
  }

  const byCategory = [...byCategoryMap.entries()]
    .map(([name, values]) => ({ name, ...values }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const open = total - completed
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return { total, completed, open, percent, byCategory }
}

/** Liefert sortierte, eindeutige Kategorien aus den aktuellen Aktivitäten. */
export function listCategories(data: StorageData): string[] {
  const categories = new Set<string>()
  for (const activity of Object.values(data.activities)) {
    if (activity.category) {
      categories.add(activity.category)
    }
  }
  return [...categories].sort((a, b) => a.localeCompare(b))
}

export { addDays, todayKey }
