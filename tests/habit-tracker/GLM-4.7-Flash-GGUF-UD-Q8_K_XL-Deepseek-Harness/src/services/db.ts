import Dexie, { Table } from 'dexie'

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

export interface Completion {
  id: string
  habitId: string
  date: string
  completedAt: string
}

export interface Mood {
  id: string
  value: number
  note?: string
  date: string
}

class RhythmDB extends Dexie {
  habits!: Table<Habit, string>
  completions!: Table<Completion, string>
  moods!: Table<Mood, string>

  constructor() {
    super('RhythmDB')
    this.version(1).stores({
      habits: '++id, name, createdAt',
      completions: '++id, habitId, date',
      moods: '++id, value, date'
    })
  }
}

export const db = new RhythmDB()
