import { useState, useEffect, useCallback } from 'react'
import {
  getHabits,
  saveHabit,
  deleteHabit,
} from '../db'
import type { Habit } from '../types'

const EMOJI_OPTIONS = [
  '\u{1F33F}', '\u{1F3C3}', '\u{1F4D8}', '\u{1F3A8}', '\u{1F9BF}',
  '\u{1F6B6}', '\u{1F4AA}', '\u{1F3C6}', '\u{1F989}', '\u{2615}',
  '\u{1F431}', '\u{1F3AF}', '\u{1F9E1}', '\u{1F3BE}', '\u{1F9A3}',
]

const COLOR_OPTIONS = [
  '#2d5a3d', '#8a6d3c', '#6b5b7b', '#5b7b8a', '#7b5b5b',
  '#5b8a6b', '#8a7b5b', '#6b7b5b', '#7b6b8a', '#8a5b6b',
]

export default function Settings({
  onToggleDark,
  darkMode,
}: {
  onToggleDark: () => void
  darkMode: boolean
}) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState(EMOJI_OPTIONS[0])
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const load = useCallback(async () => {
    const h = await getHabits()
    setHabits(h)
  }, [])

  useEffect(() => { load() }, [load])

  const createHabit = async () => {
    if (!newName.trim()) return
    const habit: Habit = {
      id: `habit_${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      createdAt: Date.now(),
    }
    await saveHabit(habit)
    setNewName('')
    setNewEmoji(EMOJI_OPTIONS[0])
    setNewColor(COLOR_OPTIONS[0])
    setShowCreate(false)
    await load()
  }

  const removeHabit = async (id: string) => {
    await deleteHabit(id)
    await load()
  }

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id)
    setEditName(habit.name)
  }

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return
    const habit = habits.find((h) => h.id === editingId)
    if (habit) {
      habit.name = editName.trim()
      await saveHabit(habit)
      setEditingId(null)
      setEditName('')
      await load()
    }
  }

  return (
    <div className="px-5 pt-10 pb-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">Einstellungen</h1>
      </header>

      {/* Habits list */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[#8a8a8a] dark:text-[#9a9a9a] uppercase tracking-wide mb-4">
          Habits
        </h2>

        {habits.length === 0 ? (
          <EmptyState
            title="Keine Habits angelegt"
            subtitle="Erstelle deinen ersten Habit, um zu beginnen."
          />
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => (
              <li key={habit.id}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e8e7e3] dark:border-[#333333] bg-white dark:bg-[#252525]">
                  <span className="text-xl w-8 text-center">{habit.emoji}</span>

                  {editingId === habit.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                      }}
                      onBlur={saveEdit}
                      autoFocus
                      className="flex-1 text-base font-medium bg-transparent border-b border-[#2d5a3d] focus:outline-none"
                    />
                  ) : (
                    <span
                      className="flex-1 text-base font-medium cursor-pointer"
                      onDoubleClick={() => startEdit(habit)}
                    >
                      {habit.name}
                    </span>
                  )}

                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="w-11 h-11 flex items-center justify-center rounded-xl text-[#8a8a8a] hover:text-[#c0392b] dark:hover:text-[#e74c3c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#c0392b] focus:ring-offset-2"
                    aria-label={`"${habit.name}" löschen`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed border-[#d0cfc9] dark:border-[#444444] text-sm text-[#8a8a8a] dark:text-[#9a9a9a] hover:border-[#2d5a3d] hover:text-[#2d5a3d] dark:hover:border-[#3d7a54] dark:hover:text-[#3d7a54] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Neuen Habit
        </button>
      </section>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#252525] rounded-t-3xl p-6 pb-8">
            <h3 className="text-lg font-semibold mb-4">Neuen Habit</h3>

            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="z.B. Meditieren"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') createHabit()
              }}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e7e3] dark:border-[#333333] bg-transparent text-base focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2 mb-4"
            />

            <label className="block text-sm font-medium mb-2">Emoji</label>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewEmoji(emoji)}
                  className={`
                    flex-shrink-0 w-11 h-11 rounded-xl text-lg flex items-center justify-center
                    border transition-all focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2
                    ${newEmoji === emoji
                      ? 'border-[#2d5a3d] bg-[#2d5a3d]/10 dark:border-[#3d7a54]'
                      : 'border-[#e8e7e3] dark:border-[#333333]'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium mb-2">Farbe</label>
            <div className="flex gap-2 mb-6">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`
                    flex-shrink-0 w-11 h-11 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2
                    ${newColor === color ? 'border-current' : 'border-transparent'}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreate(false); setNewName('') }}
                className="flex-1 px-4 py-3 rounded-xl border border-[#e8e7e3] dark:border-[#333333] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2"
              >
                Abbrechen
              </button>
              <button
                onClick={createHabit}
                disabled={!newName.trim()}
                className={`
                  flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white
                  focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2
                  ${newName.trim()
                    ? 'bg-[#2d5a3d] dark:bg-[#3d7a54]'
                    : 'bg-[#d0cfc9] dark:bg-[#333333] cursor-not-allowed'
                  }
                `}
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dark mode toggle */}
      <section>
        <h2 className="text-sm font-medium text-[#8a8a8a] dark:text-[#9a9a9a] uppercase tracking-wide mb-4">
          Darstellung
        </h2>
        <button
          onClick={onToggleDark}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl border border-[#e8e7e3] dark:border-[#333333] bg-white dark:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] focus:ring-offset-2"
        >
          <span className="text-base font-medium">Dunkelmodus</span>
          <span className={`
            w-11 h-7 rounded-full relative transition-colors duration-300
            ${darkMode ? 'bg-[#2d5a3d] dark:bg-[#3d7a54]' : 'bg-[#d0cfc9]'}
          `}>
            <span className={`
              absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300
              ${darkMode ? 'translate-x-4' : 'translate-x-0'}
            `} />
          </span>
        </button>
      </section>
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[#d0cfc9] dark:text-[#444444] mb-3">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 20h12M20 14v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-[#8a8a8a] dark:text-[#9a9a9a]">{subtitle}</p>
    </div>
  )
}
