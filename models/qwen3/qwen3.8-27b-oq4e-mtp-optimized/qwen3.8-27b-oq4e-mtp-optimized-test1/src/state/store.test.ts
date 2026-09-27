import { beforeEach, describe, expect, it } from 'vitest';
import {
  categoryStats,
  countFor,
  freshData,
  isDone,
  reducer,
  statsForDay,
} from './store';
import { setClock } from '../lib/clock';
import type { AppData } from '../lib/types';

const TODAY = '2026-09-27';
const YESTERDAY = '2026-09-26';
const TOMORROW = '2026-09-28';

function seed(): AppData {
  const data = freshData();
  const withA = reducer(data, {
    type: 'activity/add',
    activity: { name: 'Morgens laufen', description: '', category: 'Gesundheit', target: 3 },
  });
  const withB = reducer(withA, {
    type: 'activity/add',
    activity: { name: 'E-Mails aufräumen', description: '', category: 'Arbeit', target: 1 },
  });
  const withC = reducer(withB, {
    type: 'activity/add',
    activity: { name: 'Räumen', description: '', category: 'Haushalt', target: 1 },
  });
  return withC;
}

function firstActivity(data: AppData) {
  return data.activities[0];
}

describe('store: Aktivitäten verwalten', () => {
  it('add: erstellt Aktivität mit id und createdAt', () => {
    const data = freshData();
    const next = reducer(data, {
      type: 'activity/add',
      activity: { name: 'Test', description: 'd', category: 'C', target: 1 },
    });
    expect(next.activities).toHaveLength(1);
    const activity = next.activities[0];
    expect(activity.id).not.toBe('');
    expect(activity.createdAt).not.toBe('');
    expect(next.activities[0].name).toBe('Test');
  });

  it('update: patcht nur das gegebene Feld', () => {
    const data = seed();
    const a = firstActivity(data);
    const next = reducer(data, {
      type: 'activity/update',
      id: a.id,
      patch: { name: 'Abends laufen', description: 'neu', category: a.category, target: 5 },
    });
    const updated = next.activities.find((x) => x.id === a.id);
    expect(updated?.name).toBe('Abends laufen');
    expect(updated?.description).toBe('neu');
    expect(updated?.target).toBe(5);
    // andere Aktivität bleibt unberührt
    expect(next.activities.filter((x) => x.id !== a.id)).toHaveLength(2);
  });

  it('delete: entfernt Aktivität UND bereinigt den Tagesstatus aller Tage', () => {
    let data = seed();
    const a = firstActivity(data);
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/toggle', date: YESTERDAY, id: a.id });
    expect(data.progress[TODAY]).toHaveProperty(a.id);
    expect(data.progress[YESTERDAY]).toHaveProperty(a.id);

    const next = reducer(data, { type: 'activity/delete', id: a.id });
    expect(next.activities.find((x) => x.id === a.id)).toBeUndefined();
    // Referenz ist weg; der Tagseintrag darf höchstens noch leere Reste enthalten.
    expect(next.progress[TODAY]?.[a.id]).toBeUndefined();
    expect(next.progress[YESTERDAY]?.[a.id]).toBeUndefined();
  });

  it('delete: nicht vorhandene ID → kein Fehler, kein Change', () => {
    const data = seed();
    expect(reducer(data, { type: 'activity/delete', id: 'keine' })).toBe(data);
  });
});

describe('store: Tagesstatus', () => {
  beforeEach(() => {
    setClock(new Date(2026, 8, 27, 12)); // heute = 2026-09-27
  });

  it('toggle mit Ziel 1: an/aus', () => {
    let data = seed();
    const a = data.activities[1]; // Ziel 1
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(1);
    expect(isDone(data, TODAY, a)).toBe(true);
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(0);
    expect(isDone(data, TODAY, a)).toBe(false);
  });

  it('toggle mit Ziel 3: zählt hoch, bei Erreichen fertig, dann auf 0 zurück', () => {
    let data = seed();
    const a = firstActivity(data); // Ziel 3
    expect(countFor(data, TODAY, a)).toBe(0);
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(2);
    expect(isDone(data, TODAY, a)).toBe(false);
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(3);
    expect(isDone(data, TODAY, a)).toBe(true);
    // weiterer Klick → Reset
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(0);
  });

  it('decrement: geht einen Schritt zurück, Boden 0', () => {
    let data = seed();
    const a = firstActivity(data);
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/decrement', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(1);
    data = reducer(data, { type: 'progress/decrement', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/decrement', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(0);
  });

  it('Tage überschreiben sich nicht: Status je Datum isoliert', () => {
    let data = seed();
    const a = firstActivity(data);
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/toggle', date: YESTERDAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(1);
    expect(countFor(data, YESTERDAY, a)).toBe(1);
    // nur heute weiterzählen → gestern bleibt
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    expect(countFor(data, TODAY, a)).toBe(3);
    expect(countFor(data, YESTERDAY, a)).toBe(1);
  });

  it('toggle an futuristischem Tag wird abgelehnt (UI-Sperre + Reducer)', () => {
    const data = seed();
    const a = firstActivity(data);
    const before = data;
    const after = reducer(data, { type: 'progress/toggle', date: TOMORROW, id: a.id });
    expect(after).toBe(before); // Referenzgleich → kein Change
    const afterDec = reducer(data, { type: 'progress/decrement', date: TOMORROW, id: a.id });
    expect(afterDec).toBe(before);
  });

  it('toggle für unbekannte ID → kein Change', () => {
    const data = seed();
    expect(reducer(data, { type: 'progress/toggle', date: TODAY, id: 'keine' })).toBe(data);
  });
});

describe('store: Selectoren', () => {
  beforeEach(() => {
    setClock(new Date(2026, 8, 27, 12));
  });

  it('statsForDay: erledigt/offen/Prozent', () => {
    let data = seed(); // 3 Aktivitäten: Ziel 3, 1, 1
    expect(statsForDay(data, TODAY)).toEqual({ total: 3, done: 0, open: 3, percent: 0 });
    const a = firstActivity(data);
    const b = data.activities[1];
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id }); // 1/3 → offen
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: b.id }); // fertig
    const stats = statsForDay(data, TODAY);
    expect(stats.total).toBe(3);
    expect(stats.done).toBe(1);
    expect(stats.open).toBe(2);
    expect(stats.percent).toBe(33);
  });

  it('statsForDay: leerer Tag → 0 % ohne NaN', () => {
    expect(statsForDay(freshData(), TODAY).percent).toBe(0);
  });

  it('categoryStats: gruppiert und alphabetisch (de)', () => {
    let data = seed();
    const a = firstActivity(data); // Gesundheit
    const b = data.activities[2]; // Haushalt
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: a.id });
    data = reducer(data, { type: 'progress/toggle', date: TODAY, id: b.id });
    const stats = categoryStats(data, TODAY);
    expect(stats.map((s) => s.category)).toEqual(['Arbeit', 'Gesundheit', 'Haushalt']);
    const gesund = stats.find((s) => s.category === 'Gesundheit');
    expect(gesund).toEqual({ category: 'Gesundheit', total: 1, done: 0 });
    const haushalt = stats.find((s) => s.category === 'Haushalt');
    expect(haushalt).toEqual({ category: 'Haushalt', total: 1, done: 1 });
  });

  it('data/replace: kompletter Reset', () => {
    const data = seed();
    const replaced = reducer(data, { type: 'data/replace', data: freshData() });
    expect(replaced.activities).toHaveLength(0);
    expect(replaced.progress).toEqual({});
  });
});
