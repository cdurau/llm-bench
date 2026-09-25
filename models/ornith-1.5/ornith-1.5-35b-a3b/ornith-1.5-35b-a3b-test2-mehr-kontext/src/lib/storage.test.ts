import { describe, expect, it } from 'vitest'
import {
  clearStored,
  parseStored,
  readStored,
  StorageBackend,
  validateActivity,
  writeStored,
} from './storage'
import { STORAGE_KEY, STORAGE_VERSION, type StorageData } from '../types'

function memoryBackend(initial: Record<string, string> = {}): StorageBackend & { raw: string | null } {
  const raw: Record<string, string> = { ...initial }
  return {
    raw: null,
    get: (k) => (k in raw ? raw[k] : null),
    set: (k, v) => {
      raw[k] = v
    },
    remove: (k) => {
      delete raw[k]
    },
  } as unknown as StorageBackend & { raw: string | null }
}

const baseData: StorageData = {
  version: STORAGE_VERSION,
  activities: {
    a1: {
      id: 'a1',
      name: 'Sport',
      description: 'Im Fitnessstudio',
      category: 'Gesundheit',
      dailyTarget: 1,
      createdAt: '2026-01-01T08:00:00.000Z',
    },
  },
  completions: { '2026-01-01': { a1: 1 } },
}

describe('parseStored — Validierung & Migration', () => {
  it('liefert einen leeren Ausgangszustand bei leerem Speicher', () => {
    const data = parseStored(null)
    expect(data).not.toBeNull()
    expect(data!.activities).toEqual({})
    expect(data!.version).toBe(STORAGE_VERSION)
  })

  it('akzeptiert gültige v1-Daten', () => {
    const data = parseStored(JSON.stringify(baseData))
    expect(data).not.toBeNull()
    expect(data!.activities.a1.name).toBe('Sport')
    expect(data!.completions['2026-01-01'].a1).toBe(1)
  })

  it('migriert v0 (Array-basierte) Daten in v1', () => {
    const legacy = {
      version: 0,
      activities: [
        {
          id: 'x1',
          name: 'Lesen',
          description: '',
          category: 'Zeit',
          dailyTarget: 2,
          createdAt: '2026-01-02T08:00:00.000Z',
        },
      ],
      completions: [{ date: '2026-01-02', activityId: 'x1', count: 1 }],
    }
    const data = parseStored(JSON.stringify(legacy))
    expect(data).not.toBeNull()
    expect(data!.version).toBe(STORAGE_VERSION)
    expect(data!.activities.x1).toBeDefined()
    expect(data!.completions['2026-01-02'].x1).toBe(1)
  })

  it('ignoriert ungültige Aktivitäts-Einträge, statt zu abstürzen', () => {
    const messy = {
      version: 1,
      activities: {
        good: baseData.activities.a1,
        bad: { id: 'bad', name: 42 },
        alsoBad: 'nope',
      },
      completions: {},
    }
    const data = parseStored(JSON.stringify(messy))
    expect(data!.activities.good).toBeDefined()
    expect(data!.activities.bad).toBeUndefined()
    expect(data!.activities.alsoBad).toBeUndefined()
  })

  it('behandelt beschädigtes JSON sicher als leer (null -> Reset)', () => {
    expect(parseStored('{not valid json')).toBeNull()
    expect(parseStored('123')).toBeNull()
    expect(parseStored('"eine Zeichenkette"')).toBeNull()
    expect(parseStored('[1,2,3]')).toBeNull()
    expect(parseStored(JSON.stringify({ version: 999 }))).toBeNull()
  })
})

describe('readStored / writeStored — Persistenz', () => {
  it('schreibt und liest über ein Backend', () => {
    const backend = memoryBackend()
    writeStored(baseData, backend)
    const read = readStored(backend)
    expect(read.activities.a1.name).toBe('Sport')
  })

  it('schreibt unter dem Storage-Schlüssel', () => {
    const backend = memoryBackend()
    writeStored(baseData, backend)
    expect(backend.raw).toBe(JSON.stringify(baseData))
  })

  it('readStored liefert bei fehlendem Schlüssel einen leeren Zustand', () => {
    const backend = memoryBackend()
    expect(readStored(backend).activities).toEqual({})
  })

  it('clearStored entfernt die Daten', () => {
    const backend = memoryBackend()
    writeStored(baseData, backend)
    clearStored(backend)
    expect(backend.get(STORAGE_KEY)).toBeNull()
  })
})

describe('validateActivity', () => {
  it('akzeptiert gültige Eingaben', () => {
    const res = validateActivity(
      { name: '  Wasser trinken  ', description: '2L', category: 'Gesundheit', dailyTarget: 3 },
      {},
    )
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.activity.name).toBe('Wasser trinken')
      expect(res.activity.category).toBe('Gesundheit')
      expect(res.activity.dailyTarget).toBe(3)
      expect(res.activity.id).toBeTruthy()
    }
  })

  it('lehnt leeren Name ab', () => {
    const res = validateActivity({ name: '   ', category: 'x' }, {})
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/Name/)
  })

  it('lehnt leere Kategorie ab', () => {
    const res = validateActivity({ name: 'x', category: '' }, {})
    expect(res.ok).toBe(false)
  })

  it('lehnt negatives Tagesziel ab', () => {
    const res = validateActivity({ name: 'x', category: 'y', dailyTarget: -2 }, {})
    expect(res.ok).toBe(false)
  })

  it('roundet ein deziminales Ziel auf eine ganze Zahl', () => {
    const res = validateActivity({ name: 'x', category: 'y', dailyTarget: 2.9 }, {})
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.activity.dailyTarget).toBe(2)
  })
})
