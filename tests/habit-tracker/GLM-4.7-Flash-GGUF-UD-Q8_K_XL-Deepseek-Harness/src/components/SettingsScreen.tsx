import { useState } from 'react'

interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

interface SettingsScreenProps {
  habits: Habit[]
  darkMode: boolean
  onToggleDarkMode: () => void
  onAddHabit: (name: string, emoji: string, color: string) => void
  onEditHabit: (id: string, name: string, emoji: string, color: string) => void
  onDeleteHabit: (id: string) => void
}

export default function SettingsScreen({
  habits,
  darkMode,
  onToggleDarkMode,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
}: SettingsScreenProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const handleAddHabit = (name: string, emoji: string, color: string) => {
    onAddHabit(name, emoji, color)
    setShowAdd(false)
  }

  const handleEditHabit = (habitId: string, name: string, emoji: string, color: string) => {
    onEditHabit(habitId, name, emoji, color)
    setEditingHabit(null)
  }

  return (
    <div className="space-y-6">
      {/* Preferences */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Einstellungen
        </h3>
        <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Dunkler Modus
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Systemeinstellung verwenden oder manuell umschalten
            </p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle dark mode"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Habits Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Habits
          </h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn btn-primary text-sm py-2"
          >
            {showAdd ? 'Abbrechen' : '+ Neues Habit'}
          </button>
        </div>

        {showAdd && (
          <div className="card p-5 mb-4">
            <HabitEditor
              habit={{ id: '', name: '', emoji: '🎯', color: '#14b8a6', createdAt: new Date().toISOString() }}
              onSave={handleAddHabit}
              onCancel={() => setShowAdd(false)}
            />
          </div>
        )}

        {habits.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-3">🎯</div>
            <p className="text-gray-500 dark:text-gray-400">
              Keine Habits vorhanden
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="card p-4"
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
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{habit.emoji}</div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {habit.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Erstellt am {new Date(habit.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
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
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card p-5 text-center">
        <div className="text-3xl mb-2">🌙</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Rhythm v0.0.1
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Dein offlinefähiger Habit- und Stimmungs-Tracker
        </p>
      </div>
    </div>
  )
}

function HabitEditor({
  habit,
  onSave,
  onCancel,
}: {
  habit: {
    id: string
    name: string
    emoji: string
    color: string
    createdAt: string
  }
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
