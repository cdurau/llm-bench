import { useState, useRef } from 'react'
import { Habit } from '../types'
import { HABIT_COLORS, EMOJI_OPTIONS } from '../types'
import { saveHabit, deleteHabit } from '../db'

interface SettingsProps {
  habits: Habit[]
  onReload: () => void
}

export default function Settings({ habits, onReload }: SettingsProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0])
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setName('')
    setSelectedEmoji(EMOJI_OPTIONS[0])
    setSelectedColor(HABIT_COLORS[0])
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (habit: Habit) => {
    setName(habit.name)
    setSelectedEmoji(habit.emoji)
    setSelectedColor(habit.color)
    setEditingId(habit.id)
    setShowForm(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (editingId) {
      const habit = habits.find(h => h.id === editingId)
      if (habit) {
        await saveHabit({ ...habit, name: name.trim(), emoji: selectedEmoji, color: selectedColor })
      }
    } else {
      const habit: Habit = {
        id: crypto.randomUUID(),
        name: name.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
        createdAt: Date.now()
      }
      await saveHabit(habit)
    }
    resetForm()
    onReload()
  }

  const handleDelete = async (id: string) => {
    await deleteHabit(id)
    onReload()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111] dark:text-white">Einstellungen</h1>

      {/* Habits list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-[#787774] uppercase tracking-wider">Habits</h2>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="px-3 py-1.5 text-sm bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
          >
            + Hinzufügen
          </button>
        </div>

        {habits.length === 0 ? (
          <EmptyState onAdd={() => { resetForm(); setShowForm(true) }} />
        ) : (
          <div className="space-y-2">
            {habits.map(habit => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-lg flex-shrink-0">{habit.emoji}</span>
                <span className="flex-1 font-medium text-[#111111] dark:text-white truncate">
                  {habit.name}
                </span>
                <button
                  onClick={() => handleEdit(habit)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-[#787774] hover:bg-[#F7F6F3] dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                  aria-label={`${habit.name} bearbeiten`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-[#787774] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[#9F2F2D] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
                  aria-label={`${habit.name} löschen`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit/Add form */}
      {showForm && (
        <div className="p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A] space-y-4">
          <h2 className="text-sm font-medium text-[#787774] uppercase tracking-wider">
            {editingId ? 'Habit bearbeiten' : 'Neuer Habit'}
          </h2>

          <div>
            <label className="block text-xs text-[#787774] mb-1.5">Name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="z.B. Meditieren"
              className="w-full text-base bg-transparent border-b border-[#EAEAEA] dark:border-white/10 outline-none py-2 text-[#111111] dark:text-white placeholder-[#787774] focus:border-[#111111] dark:focus:border-white transition-colors"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-xs text-[#787774] mb-1.5">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white ${
                    selectedEmoji === emoji
                      ? 'border-[#111111] dark:border-white bg-[#F7F6F3] dark:bg-white/10'
                      : 'border-[#EAEAEA] dark:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-white/5'
                  }`}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#787774] mb-1.5">Farbe</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white ${
                    selectedColor === color
                      ? 'border-[#111111] dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Farbe ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-md disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
            >
              {editingId ? 'Speichern' : 'Hinzufügen'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-[#787774] hover:text-[#111111] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="py-12 text-center border border-dashed border-[#EAEAEA] dark:border-white/10 rounded-xl">
      <p className="text-[#787774] text-sm">Noch keine Habits vorhanden.</p>
      <button
        onClick={onAdd}
        className="mt-3 px-4 py-2 text-sm bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] dark:focus-visible:ring-white"
      >
        Ersten Habit anlegen
      </button>
    </div>
  )
}
