import { useState, useEffect } from 'react'
import { useHabits } from '../hooks'
import { useDarkMode } from '../hooks'

const COLORS = [
  '#6B7280', // stone
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
] as const

type ColorType = typeof COLORS[number]

const EMOJIS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '✍️', '🎵', '💊', '🌿', '⭐'] as const

interface FormState {
  name: string
  emoji: string
  color: ColorType
}

export default function Settings() {
  const { habits, loading, add, update, remove } = useHabits()
  const { dark, toggle } = useDarkMode()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const emptyForm: FormState = { name: '', emoji: '💪', color: COLORS[0] }
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (editingId) {
      const h = habits.find((h) => h.id === editingId)
      if (h) setForm({ name: h.name, emoji: h.emoji, color: h.color as ColorType })
    } else {
      setForm(emptyForm)
    }
  }, [editingId, habits])

  const handleSubmit = () => {
    const name = form.name.trim()
    if (!name) return

    if (editingId) {
      update(editingId, form)
    } else {
      add(form)
    }
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Habit wirklich löschen?')) {
      remove(id)
    }
  }

  if (loading) {
    return (
      <div className="px-5 pt-12 pb-4">
        <div className="h-8 w-40 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse mb-3" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-5 pt-12 pb-4">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">
          Einstellungen
        </h1>
      </header>

      {/* Dark mode */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
          Erscheinungsbild
        </h2>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-4 py-4 touch-manipulation"
            aria-label={dark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{dark ? '🌙' : '☀️'}</span>
              <div className="text-left">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  {dark ? 'Dunkler Modus' : 'Heller Modus'}
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-600">
                  {dark ? 'Dunkles Design aktiv' : 'Helles Design aktiv'}
                </p>
              </div>
            </div>
            <span className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${dark ? 'bg-stone-700' : 'bg-stone-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${dark ? 'translate-x-5' : 'translate-x-0'}`} />
            </span>
          </button>
        </div>
      </section>

      {/* Habits */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            Habits
          </h2>
          <button
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors touch-manipulation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Neu
          </button>
        </div>

        {habits.length === 0 && !showForm ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center">
            <p className="text-stone-400 dark:text-stone-600 text-sm">
              Keine Habits vorhanden. Erstelle deinen ersten.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Form */}
            {showForm && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-4">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Name des Habits"
                  maxLength={30}
                  autoFocus
                  className="w-full text-sm bg-transparent border-b border-stone-200 dark:border-stone-800 pb-1 text-stone-800 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
                />

                {/* Emoji picker */}
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-600 mb-2">Emoji</p>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all touch-manipulation ${
                          form.emoji === e
                            ? 'bg-stone-100 dark:bg-stone-800 scale-110'
                            : 'hover:bg-stone-50 dark:hover:bg-stone-950'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-600 mb-2">Farbe</p>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, color: c as ColorType }))}
                        className={`w-8 h-8 rounded-lg transition-all touch-manipulation ${
                          form.color === c ? 'ring-2 ring-offset-2 ring-stone-400 dark:ring-offset-stone-900 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Farbe ${c}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSubmit}
                    disabled={!form.name.trim()}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors disabled:opacity-40 touch-manipulation"
                  >
                    {editingId ? 'Speichern' : 'Anlegen'}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setEditingId(null) }}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors touch-manipulation"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {/* Habit list */}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center gap-3 px-4 py-3.5"
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${habit.color}20` }}
                >
                  {habit.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                    {habit.name}
                  </p>
                </div>
                <button
                  onClick={() => { setEditingId(habit.id); setShowForm(true) }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors touch-manipulation"
                  aria-label={`${habit.name} bearbeiten`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors touch-manipulation"
                  aria-label={`${habit.name} löschen`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
