import { describe, expect, it } from 'vitest'
import {
  computeStats,
  createStore,
  getCompletedCount,
  isCompleted,
  listCategories,
  type Store,
} from './createStore'
import { StorageBackend, type StorageData } from './storage'
import type { Activity } from '../types'

function memoryBackend(initial: Record<string, string> = {}): StorageBackend {
  const raw: Record<string, string> = { ...initial }
  const backend: StorageBackend = {
    get: (k) => (k in raw ? raw[k] : null),
    set: (k, v) => {
      raw[k] = v
    },
    remove: (k) => {
      delete raw[k]
    },
  }
  return backend
}

const FIXED_NOW = new Date(2026, 8, 24, 10, 0, 0) // 2026-09-24
const today = '2026-09-24'
const yesterday = '2026-09-23'
const tomorrow = '2026-09-25'

function makeStore(backend?: StorageBackend, now: Date = FIXED_NOW): Store {
  return createStore({ backend, now: () => now })
}

describe('store — Aktivitäten verwalten', () => {
  it('erstellt eine Aktivität', () => {
    const store = makeStore()
    const activity = store.addActivity({ name: 'Lesen', category: 'Zeit', dailyTarget: 2 })
    expect(activity).not.toBeNull()
    expect(store.getState().data.activities[activity!.id].name).toBe('Lesen')
    expect(store.getState().data.activities[activity!.id].dailyTarget).toBe(2)
  })

  it('lehnt das Anlegen einer ungültigen Aktivität ab', () => {
    const store = makeStore()
    expect(store.addActivity({ name: '  ', category: 'x' })).toBeNull()
    expect(store.getState().data.activities).toEqual({})
  })

  it('bearbeitet eine Aktivität', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Sport', category: 'G' })!
    const ok = store.editActivity(a.id, { name: 'Fitness', category: 'Gesundheit', dailyTarget: 3 })
    expect(ok).toBe(true)
    expect(store.getState().data.activities[a.id].name).toBe('Fitness')
    expect(store.getState().data.activities[a.id].dailyTarget).toBe(3)
  })

  it('lehnt das Bearbeiten einer unbekannten ID ab', () => {
    const store = makeStore()
    expect(store.editActivity('nope', { name: 'x', category: 'y' })).toBe(false)
  })

  it('löscht eine Aktivität und deren veraltete Zählstände', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Sport', category: 'G' })!
    store.toggleComplete(a.id, today)
    expect(getCompletedCount(store.getState().data, a.id, today)).toBe(1)
    store.deleteActivity(a.id)
    expect(store.getState().data.activities[a.id]).toBeUndefined()
    // Verwaigter Zählstand wurde entfernt.
    const anyDate = Object.keys(store.getState().data.completions)[0]
    expect(anyDate).toBeUndefined()
  })
})

describe('store — Tagesstatus', () => {
  it('schaltet einen Eintrag ohne Ziel ein/aus', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Wasser', category: 'G', dailyTarget: 0 })!
    store.toggleComplete(a.id, today)
    expect(getCompletedCount(store.getState().data, a.id, today)).toBe(1)
    expect(isCompleted(store.getState().data, a, today)).toBe(true)
    store.toggleComplete(a.id, today)
    expect(getCompletedCount(store.getState().data, a.id, today)).toBe(0)
  })

  it('zählt ein Tagesziel hoch und runter', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Lesen', category: 'Z', dailyTarget: 3 })!
    store.toggleComplete(a.id, today)
    store.toggleComplete(a.id, today)
    expect(getCompletedCount(store.getState().data, a.id, today)).toBe(2)
    expect(isCompleted(store.getState().data, a, today)).toBe(false)
    store.toggleComplete(a.id, today)
    expect(isCompleted(store.getState().data, a, today)).toBe(true)
    store.toggleComplete(a.id, today)
    expect(getCompletedCount(store.getState().data, a.id, today)).toBe(2)
  })

  it('überschreibt verschiedene Kalendertage nicht', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Sport', category: 'G', dailyTarget: 1 })!
    store.toggleComplete(a.id, today)
    expect(getCompletedCount(store.getState().data, a.id, today)).toBe(1)
    expect(getCompletedCount(store.getState().data, a.id, yesterday)).toBe(0)
  })

  it('markiert zukünftige Tage nicht als erledigt', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Sport', category: 'G' })!
    store.toggleComplete(a.id, tomorrow)
    expect(getCompletedCount(store.getState().data, a.id, tomorrow)).toBe(0)
  })

  it('merkt sich den Status über Subscriber-Ankündigungen', () => {
    const store = makeStore()
    const a = store.addActivity({ name: 'Sport', category: 'G' })!
    let updates = 0
    store.subscribe(() => {
      updates++
    })
    store.toggleComplete(a.id, today)
    expect(updates).toBe(1)
  })
})

describe('store — Datumswechsel', () => {
  it('wählt einen Tag aus', () => {
    const store = makeStore()
    store.setSelectedDate(yesterday)
    expect(store.getState().selectedDate).toBe(yesterday)
  })
})

describe('store — Persistenz & Wiederherstellung', () => {
  it('wiederholt Daten über ein geteiltes Backend (Reload-Simulation)', () => {
    const backend = memoryBackend()
    const store1 = makeStore(backend)
    const a = store1.addActivity({ name: 'Sport', category: 'G', dailyTarget: 2 })!
    store1.toggleComplete(a.id, today)

    // Neue Instanz, gleicher Storage -> Daten müssen vorhanden sein.
    const store2 = makeStore(backend)
    expect(store2.getState().data.activities[a.id]).toBeDefined()
    expect(getCompletedCount(store2.getState().data, a.id, today)).toBe(1)
  })

  it('erholt sich von beschädigten gespeicherten Daten', () => {
    const backend = memoryBackend({
      pulseboard: '{ this ist beschädigt }',
    })
    const store = makeStore(backend)
    // Kein Absturz, leerer Zustand.
    expect(store.getState().data.activities).toEqual({})
    // Nach dem Laden wird ein sauberer Zustand zurückschrieben.
    store.reload()
    expect(typeof store.getState().data.version).toBe('number')
  })

  it('reset löscht alle Daten', () => {
    const backend = memoryBackend()
    const store = makeStore(backend)
    store.addActivity({ name: 'Sport', category: 'G' })
    expect(Object.keys(store.getState().data.activities).length).toBe(1)
    store.reset()
    expect(Object.keys(store.getState().data.activities).length).toBe(0)
  })
})

describe('computeStats / listCategories', () => {
  function populatedStore(): { store: Store; sport: Activity; read: Activity } {
    const store = makeStore()
    const sport = store.addActivity({ name: 'Sport', category: 'Gesundheit', dailyTarget: 1 })!
    const read = store.addActivity({ name: 'Lesen', category: 'Zeit', dailyTarget: 0 })!
    store.toggleComplete(sport.id, today)
    return { store, sport, read }
  }

  it('berechnet erledigt/offen/Prozent', () => {
    const { store } = populatedStore()
    const stats = computeStats(store.getState().data, today)
    expect(stats.total).toBe(2)
    expect(stats.completed).toBe(1)
    expect(stats.open).toBe(1)
    expect(stats.percent).toBe(50)
  })

  it('ordnet Kategorien zu', () => {
    const { store } = populatedStore()
    const stats = computeStats(store.getState().data, today)
    expect(stats.byCategory).toEqual([
      { name: 'Gesundheit', total: 1, completed: 1 },
      { name: 'Zeit', total: 1, completed: 0 },
    ])
  })

  it('listCategories liefert sortierte, eindeutige Namen', () => {
    const { store } = populatedStore()
    expect(listCategories(store.getState().data)).toEqual(['Gesundheit', 'Zeit'])
  })

  it('zeigt 0 % bei fehlenden Aktivitäten', () => {
    const store = makeStore()
    const stats = computeStats(store.getState().data, today)
    expect(stats.completed).toBe(0)
    expect(stats.percent).toBe(0)
  })
})
