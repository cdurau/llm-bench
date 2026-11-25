import { useState } from 'react'
import { db } from '../services/db'

interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

interface Mood {
  id: string
  value: number
  note?: string
  date: string
}

interface Stats {
  todayHabits: number
  totalHabits: number
}

interface TodayScreenProps {
  habits: Habit[]
  moods: Mood[]
  stats: Stats
  completedToday: number
  onToggleHabit: (id: string, date: string) => void
  onEditHabit: (id: string, name: string, emoji: string, color: string) => void
  onDeleteHabit: (id: string) => void
  onAddMood: (value: number, note?: string) => void
  onUpdateMood: (id: string, value: number, note?: string) => void
}

export default function TodayScreen({
  habits,
  moods,
  stats,
  completedToday,
  onToggleHabit,
  onEditHabit,
  onDeleteHabit,
  onAddMood,
  onUpdateMood,
}: TodayScreenProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingMood, setEditingMood] = useState<Mood | null>(null)
  const [moodValue, setMoodValue] = useState<number>(3)
  const [moodNote, setMoodNote] = useState('')

  const handleToggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    onToggleHabit(habitId, today)
  }

  const handleEditHabit = (habitId: string, name: string, emoji: string, color: string) => {
    onEditHabit(habitId, name, emoji, color)
    setEditingHabit(null)
  }

  const handleAddMood = () => {
    onAddMood(moodValue, moodNote || undefined)
    setMoodValue(3)
    setMoodNote('')
  }

  const handleUpdateMood = (moodId: string, value: number, note: string) => {
    onUpdateMood(moodId, value, note)
    setEditingMood(null)
  }

  // handleDeleteMood is declared but never used

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Noch keine Habits</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Erstelle dein erstes Habit, um mitzuzählen
        </p>
        <button
          onClick={() => setEditingHabit({ id: '', name: '', emoji: '🎯', color: '#14b8a6', createdAt: new Date().toISOString() })}
          className="btn btn-primary"
        >
          Erstellen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedToday} von {stats.totalHabits} erledigt
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {stats.totalHabits > 0 ? Math.round((completedToday / stats.totalHabits) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${stats.totalHabits > 0 ? (completedToday / stats.totalHabits) * 100 : 0}%`,
              backgroundColor: '#14b8a6'
            }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const today = new Date().toISOString().split('T')[0]
          const completion = db.completions.where({ habitId: habit.id, date: today }).first()
          completion.then(c => {
            if (c) {
              // Habit is completed
            }
          })

          return (
            <div
              key={habit.id}
              className="card p-4 transition-all duration-200 hover:shadow-md"
              style={{
                borderLeft: `4px solid ${habit.color}`
              }}
            >
              {editingHabit?.id === habit.id ? (
                <HabitEditor
                  habit={editingHabit}
                  onSave={handleEditHabit}
                  onCancel={() => setEditingHabit(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xl transition-all duration-200 opacity-50"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {habit.emoji}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {/* Streaks könnten hier angezeigt werden */}
                      </p>
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="icon-btn"
                      aria-label="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="icon-btn"
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Habit Button */}
      <button
        onClick={() => setEditingHabit({ id: '', name: '', emoji: '🎯', color: '#14b8a6', createdAt: new Date().toISOString() })}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
      >
        + Neues Habit
      </button>

      {/* Mood Entry */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Wie fühlst du dich heute?
        </h3>
        {editingMood ? (
          <MoodEditor
            mood={editingMood}
            onSave={handleUpdateMood}
            onCancel={() => setEditingMood(null)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setMoodValue(value)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                    moodValue === value
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`Stimmung ${value}`}
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddMood}
              className="btn btn-primary w-full"
            >
              Speichern
            </button>
            {moods.length > 0 && moods[0].date.startsWith(new Date().toISOString().split('T')[0]) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Deine letzte Eintragung: {moods[0].value}/5
                </span>
                <button
                  onClick={() => setEditingMood(moods[0])}
                  className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                >
                  Bearbeiten
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HabitEditor({
  habit,
  onSave,
  onCancel,
}: {
  habit: Habit
  onSave: (id: string, name: string, emoji: string, color: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(habit.name)
  const [emoji, setEmoji] = useState(habit.emoji)
  const [color, setColor] = useState(habit.color)

  const handleSave = () => {
    onSave(habit.id || crypto.randomUUID(), name, emoji, color)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Beispielnamen"
        />
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emoji
          </label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="input"
            placeholder="🎯"
            maxLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Farbe
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="input h-11 w-full"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 btn btn-primary"
        >
          Speichern
        </button>
        <button
          onClick={onCancel}
          className="flex-1 btn btn-ghost"
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}

function MoodEditor({
  mood,
  onSave,
  onCancel,
}: {
  mood: Mood
  onSave: (id: string, value: number, note: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(mood.value)
  const [note, setNote] = useState(mood.note || '')

  const handleSave = () => {
    onSave(mood.id, value, note)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stimmung
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              onClick={() => setValue(m)}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                value === m
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notiz (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input h-24 resize-none"
          placeholder="Gib eine kurze Notiz ein..."
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 btn btn-primary"
        >
          Speichern
        </button>
        <button
          onClick={onCancel}
          className="flex-1 btn btn-ghost"
        >
          Abbrechen
        </button>
      </div>
    </div>
  )
}
