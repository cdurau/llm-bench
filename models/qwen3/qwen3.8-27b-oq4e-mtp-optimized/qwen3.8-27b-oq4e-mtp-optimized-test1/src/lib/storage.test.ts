import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SCHEMA_VERSION,
  STORAGE_KEY,
  emptyData,
  load,
  parseStored,
  save,
} from './storage';
import type { AppData } from './types';

function writeRaw(raw: string) {
  window.localStorage.setItem(STORAGE_KEY, raw);
}

function validData(): AppData {
  return {
    version: SCHEMA_VERSION,
    activities: [
      {
        id: 'a1',
        name: 'Morgens laufen',
        description: '',
        category: 'Gesundheit',
        target: 3,
        createdAt: '2026-09-27T08:00:00.000Z',
      },
      {
        id: 'a2',
        name: 'E-Mails aufräumen',
        description: 'einmal täglich',
        category: 'Arbeit',
        target: 1,
        createdAt: '2026-09-27T08:05:00.000Z',
      },
    ],
    progress: {
      '2026-09-27': { a1: 2, a2: 1 },
      '2026-09-26': { a1: 3 },
    },
  };
}

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('liefert leeres Dokument, wenn nichts gespeichert ist', () => {
    const { data, recovery } = load();
    expect(recovery).toBe('empty');
    expect(data.activities).toEqual([]);
    expect(data.progress).toEqual({});
  });

  it('Roundtrip: save → load behält alle Tage separat bei', () => {
    const data = validData();
    expect(save(data)).toBe(true);
    const { data: back, recovery } = load();
    expect(recovery).toBe('ok');
    expect(back).toEqual(data);
    // Tage überschreiben sich nicht:
    expect(back.progress['2026-09-27']).toEqual({ a1: 2, a2: 1 });
    expect(back.progress['2026-09-26']).toEqual({ a1: 3 });
  });

  it('korruptes JSON → leeres Dokument + Recovery "corrupt", kein Crash', () => {
    writeRaw('das ist kein JSON {{{');
    const { data, recovery } = load();
    expect(recovery).toBe('corrupt');
    expect(data.activities).toEqual([]);
  });

  it('falscher Wurzeltyp → Recovery "corrupt"', () => {
    writeRaw(JSON.stringify(['a', 'b']));
    const { data, recovery } = load();
    expect(recovery).toBe('corrupt');
    expect(data.activities).toEqual([]);

    writeRaw(JSON.stringify('"nur ein string"'));
    expect(load().recovery).toBe('corrupt');
  });

  it('alte Version → Daten werden gerettet und als "migrated" markiert', () => {
    const data = validData();
    writeRaw(JSON.stringify({ ...data, version: 0 }));
    const { data: back, recovery } = load();
    expect(recovery).toBe('migrated');
    expect(back.version).toBe(SCHEMA_VERSION);
    expect(back.activities.map((a) => a.id)).toEqual(['a1', 'a2']);
  });

  it('sanitize: leere Namen und doppelte IDs fallen raus', () => {
    const { data, migrated } = parseStored({
      version: SCHEMA_VERSION,
      activities: [
        { id: 'x', name: '   ' },
        { id: 'x', name: 'Doppel-ID, erster gültiger' },
        { id: 'x', name: 'Doppel-ID, zweiter wird verworfen' },
        { name: 'Keine ID' },
        { id: 'ok', name: 'Gültig' },
      ],
      progress: {},
    });
    expect(migrated).toBe(false);
    expect(data).not.toBeNull();
    expect(data as AppData).toMatchObject({
      activities: [
        { id: 'x', name: 'Doppel-ID, erster gültiger' },
        { id: 'ok', name: 'Gültig' },
      ],
    });
  });

  it('sanitize: Ziel wird normalisiert (String, 0, NaN → 1)', () => {
    const { data } = parseStored({
      version: SCHEMA_VERSION,
      activities: [
        { id: 'a', name: 'A', target: '5' },
        { id: 'b', name: 'B', target: 0 },
        { id: 'c', name: 'C', target: Number.NaN },
      ],
      progress: {},
    });
    const byId = new Map((data as AppData).activities.map((a) => [a.id, a.target]));
    expect(byId.get('a')).toBe(5);
    expect(byId.get('b')).toBe(1);
    expect(byId.get('c')).toBe(1);
  });

  it('sanitize: fehlende Kategorie wird zu "Ohne Kategorie"', () => {
    const { data } = parseStored({
      version: SCHEMA_VERSION,
      activities: [{ id: 'a', name: 'A' }],
      progress: {},
    });
    expect((data as AppData).activities[0].category).toBe('Ohne Kategorie');
  });

  it('sanitize: ungelte Datums-Keys und tote Referenzen im Progress fallen raus', () => {
    const { data } = parseStored({
      version: SCHEMA_VERSION,
      activities: [{ id: 'a', name: 'A', target: 2 }],
      progress: {
        '2026-9-2': { a: 1 }, // ungültiges Format
        '2026-09-27': { a: 1, ghost: 3 }, // ghost: keine Aktivität
      },
    });
    expect(data).not.toBeNull();
    expect((data as AppData).progress).toEqual({ '2026-09-27': { a: 1 } });
  });

  it('sanitize: Zählstand wird auf 0..target geklemmt, negative Werte verworfen', () => {
    const { data } = parseStored({
      version: SCHEMA_VERSION,
      activities: [{ id: 'a', name: 'A', target: 2 }],
      progress: {
        '2026-09-27': { a: 99 },
        '2026-09-26': { a: -1 },
      },
    });
    expect((data as AppData).progress['2026-09-27']).toEqual({ a: 2 });
    expect((data as AppData).progress['2026-09-26']).toBeUndefined();
  });

  it('save meldet Fehler bei vollem/ge-sperrtem Speicher', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
    expect(save(validData())).toBe(false);
    spy.mockRestore();
  });

  it('emptyData liefert versioniertes leeres Dokument', () => {
    expect(emptyData()).toEqual({ version: SCHEMA_VERSION, activities: [], progress: {} });
  });
});
