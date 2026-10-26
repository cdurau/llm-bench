import { getDB } from './db'
import { todayKey } from './date'
import { completionKey } from './types'
import type { Habit, Completion, Mood, AppSettings, ThemeMode } from './types'

/* ── Reaktivität: Subscribable Snapshot ───────────────────────────────── */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(): void {
  for (const l of listeners) l()
}

let snapshotCache: Snapshot | null = null
const snapshotWaiters: Array<(s: Snapshot) => void> = []

/** Liest den gesamten Zustand neu ein und benachrichtigt alle Subscriber. */
export async function refreshSnapshot(): Promise<Snapshot> {
  const snap = await loadSnapshot()
  snapshotCache = snap
  const waiters = snapshotWaiters
  snapshotWaiters.length = 0
  for (const w of waiters) w(snap)
  return snap
}

export function getSnapshot(): Snapshot | null {
  return snapshotCache
}

/* ── Snapshot ─────────────────────────────────────────────────────────── */
export interface Snapshot {
  habits: Habit[]
  completions: Completion[]
  moods: Mood[]
  settings: AppSettings
}

async function loadSnapshot(): Promise<Snapshot> {
  const db = await getDB()
  const [habits, completions, moods, settings] = await Promise.all([
    db.getAll('habits'),
    db.getAll('completions'),
    db.getAll('moods'),
    db.getAll('settings'),
  ])
  return {
    habits,
    completions,
    moods,
    settings: settings[0] ?? { theme: 'system' as ThemeMode },
  }
}

/* ── Habits ───────────────────────────────────────────────────────────── */
export async function addHabit(input: {
  name: string
  emoji: string
  color: string
}): Promise<Habit> {
  const db = await getDB()
  const habits = await db.getAll('habits')
  const habit: Habit = {
    id: crypto.randomUUID(),
    name: input.name.trim() || 'Neuer Habit',
    emoji: input.emoji || '✨',
    color: input.color,
    createdAt: Date.now(),
    order: habits.length,
  }
  await db.put('habits', habit)
  notify()
  return habit
}

export async function updateHabit(id: string, patch: Partial<Pick<Habit, 'name' | 'emoji' | 'color' | 'order'>>): Promise<void> {
  const db = await getDB()
  const habit = await db.get('habits', id)
  if (!habit) return
  const next = { ...habit, ...patch }
  await db.put('habits', next)
  notify()
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('habits', 'completions', 'write')
  await tx.store.delete(id)
  const completions = await tx.db.getAll('completions')
  for (const c of completions) {
    if (c.habitId === id) await tx.db.delete('completions', c.id)
  }
  await tx.done
  notify()
}

/* ── Abhaken ──────────────────────────────────────────────────────────── */
export async function toggleCompletion(habitId: string, day: string = todayKey()): Promise<void> {
  const db = await getDB()
  const key = completionKey(habitId, day)
  const existing = await db.get('completions', key)
  if (existing) {
    await db.delete('completions', key)
  } else {
    await db.put('completions', { id: key, habitId, day, ts: Date.now() })
  }
  notify()
}

/* ── Stimmung ─────────────────────────────────────────────────────────── */
export async function setMood(day: string, value: number, note: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('moods', day)
  const ts = existing?.ts ?? Date.now()
  await db.put('moods', { id: day, day, value, note, ts })
  notify()
}

export async function clearMood(day: string): Promise<void> {
  const db = await getDB()
  await db.delete('moods', day)
  notify()
}

/* ── Einstellungen ────────────────────────────────────────────────────── */
export async function setTheme(theme: ThemeMode): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key: 'theme', theme })
  notify()
}

/** Alias für konsistentere Aufrufe. */
export function getSettings(): Promise<AppSettings> {
  return getDB().then((db) => db.get('settings', 'theme')).then((s) => s ?? ({ theme: 'system' } as AppSettings))
}
