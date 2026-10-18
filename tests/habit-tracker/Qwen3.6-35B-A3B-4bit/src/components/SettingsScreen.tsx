import { useState, useEffect } from 'react'
import {
  getHabits, addHabit, updateHabit, removeHabit,
  getTodayMood, saveMood, getStreaks,
  readTheme, writeTheme, getTodayString, formatDateGerman,
  type Habit, type MoodEntry
} from '../db'

const HABIT_COLORS = [
  { name: 'Terrakotta', value: '#c4956a' },
  { name: 'Salbei', value: '#6a9c8a' },
  { name: 'Lavendel', value: '#8a7ab0' },
  { name: 'Ziegelrot', value: '#b07a7a' },
  { name: 'Türkis', value: '#7a9cc4' },
  { name: 'Senf', value: '#c4b06a' },
]

const MOOD_EMOJIS = ['', '😞', '😕', '😐', '🙂', '😊']
const MOOD_LABELS = ['', 'Sehr schlecht', 'Schlecht', 'Ausgewogen', 'Gut', 'Ausgezeichnet']
const EMOJI_LIST = ['💧', '🏃', '📚', '🧘', '✍️', '💪', '🎨', '🎵', '🍳', '💊']

export default function SettingsScreen({ onThemeOverride }: { onThemeOverride?: (mode: 'light' | 'dark') => void }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [streaks, setStreaks] = useState<Record<string, { current: number; longest: number }>>({})
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('💧')
  const [newColor, setNewColor] = useState(HABIT_COLORS[0].value)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto')
  const [moodNote, setMoodNote] = useState('')
  const [isEditingMood, setIsEditingMood] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const h = await getHabits()
      const s = await getStreaks()
      const m = await getTodayMood()
      if (mounted) {
        setHabits(h)
        setStreaks(s)
        setTodayMood(m)
        if (m) { setMoodNote(m.note || ''); setIsEditingMood(false) }
        const stored = readTheme()
        setThemeMode(stored || 'auto')
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addHabit(newName.trim(), newEmoji, newColor)
    setHabits(await getHabits())
    setStreaks(await getStreaks())
    setNewName('')
    setShowNew(false)
  }

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return
    await updateHabit(id, { name: editName.trim() })
    setHabits(await getHabits())
    setStreaks(await getStreaks())
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (id: string) => {
    await removeHabit(id)
    setHabits(await getHabits())
    setStreaks(await getStreaks())
  }

  // One-per-day mood submission: only allow saving if no mood exists for today
  const handleSaveMood = async (value: number) => {
    // Only allow saving if no mood exists for today (one-per-day constraint)
    if (todayMood && !isEditingMood) return
    await saveMood(value, moodNote || undefined)
    const updated = await getTodayMood()
    setTodayMood(updated)
    setIsEditingMood(false)
  }

  const handleSaveNote = async () => {
    const value = isEditingMood ? 3 : (todayMood?.value || 3)
    await saveMood(value, moodNote.trim() || undefined)
    const updated = await getTodayMood()
    setTodayMood(updated)
    setIsEditingMood(false)
  }

  const handleStartEditMood = () => {
    if (todayMood) {
      setIsEditingMood(true)
      setMoodNote(todayMood.note || '')
    }
  }

  const handleThemeOverride = (mode: 'light' | 'dark') => {
    writeTheme(mode)
    setThemeMode(mode)
    onThemeOverride?.(mode)
  }

  // Determine display mode for mood section
  const hasTodayMood = !!todayMood
  const moodDate = todayMood ? getTodayString() : ''

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-5 pt-14 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
          Konfiguration
        </p>
        <h2 className="text-3xl font-bold tracking-tight mt-1 text-[var(--color-text)]">Einstellungen</h2>
      </div>

      <div className="px-5 flex-1 pb-24 space-y-5">
        {/* Theme */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
            Erscheinungsbild
          </h3>
          <div className="flex gap-2">
            {(['auto', 'light', 'dark'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => mode === 'auto' ? (() => { try { localStorage.removeItem('rhythm-theme-mode') } catch {} setThemeMode('auto') })() : handleThemeOverride(mode as 'light' | 'dark')}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-semibold border transition-colors ${themeMode === mode ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-surface)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
              >
                {mode === 'auto' ? 'System' : mode === 'light' ? 'Hell' : 'Dunkel'}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">
            Standardmäßig folgt Rhythm deinem System-Setting. Du kannst es hier manuell überschreiben.
          </p>
        </div>

        {/* Today's mood — one per day */}
        <div className="bg-[var(--color-surface)] rounded-xl p-4">
          <h3 className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">
            Heutige Stimmung
          </h3>

          {hasTodayMood && !isEditingMood ? (
            /* Display mode: mood already saved for today */
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{MOOD_EMOJIS[todayMood.value]}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium">{MOOD_LABELS[todayMood.value]}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">{getTodayString() === moodDate ? 'Heute' : formatDateGerman(moodDate)}</p>
                  {todayMood.note && <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{todayMood.note}</p>}
                </div>
              </div>
              <p className="text-[10px] text-[var(--color-text-tertiary)] mb-2">
                Stimmung für {getTodayString() === moodDate ? 'heute' : formatDateGerman(moodDate)} bereits erfasst.
              </p>
              <button
                onClick={handleStartEditMood}
                className="w-full py-2.5 border border-[var(--color-border)] rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                Heute ändern
              </button>
            </div>
          ) : (
            /* Input mode: no mood for today yet */
            <div className="space-y-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => handleSaveMood(v)} className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border transition-colors ${v === 3 ? 'border-[var(--color-text)] bg-[var(--color-surface-pressed)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}>
                    <span className="text-xl">{MOOD_EMOJIS[v]}</span>
                    <span className="text-[9px] text-[var(--color-text-secondary)]">{MOOD_LABELS[v]}</span>
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="settings-note" className="text-[10px] text-[var(--color-text-secondary)] block mb-1.5">Notiz (optional)</label>
                <textarea id="settings-note" value={moodNote} onChange={e => setMoodNote(e.target.value)} placeholder="Heute war…" rows={2} className="w-full bg-transparent border-b border-[var(--color-border)] pb-2 text-xs resize-none placeholder:text-[var(--color-text-tertiary)]" />
              </div>
              <button onClick={handleSaveNote} className="w-full py-3 bg-[var(--color-text)] text-[var(--color-surface)] text-[10px] font-semibold rounded-lg">Speichern</button>
            </div>
          )}
        </div>

        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Habits</h3>
            <button onClick={() => setShowNew(!showNew)} className="text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">{showNew ? 'Abbrechen' : '+ Neu'}</button>
          </div>

          {showNew && (
            <div className="bg-[var(--color-surface)] rounded-xl p-4 space-y-4 mb-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name des Habits" className="w-full bg-transparent border-b border-[var(--color-border)] pb-2 text-xs placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-text)] outline-none" autoFocus onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1.5">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_LIST.map(em => (
                    <button key={em} onClick={() => setNewEmoji(em)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform ${newEmoji === em ? 'bg-[var(--color-surface-pressed)]' : ''}`}>{em}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1.5">Farbe</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map(c => (
                    <button key={c.value} onClick={() => setNewColor(c.value)} className={`w-6 h-6 rounded-full transition-transform ${newColor === c.value ? 'scale-125 ring-2 ring-[var(--color-text)] ring-offset-2' : ''}`} style={{ backgroundColor: c.value }} aria-label={c.name} title={c.name} />
                  ))}
                </div>
              </div>
              <button onClick={handleAdd} disabled={!newName.trim()} className="w-full py-3 bg-[var(--color-text)] text-[var(--color-surface)] text-[10px] font-semibold rounded-lg disabled:opacity-40">Erstellen</button>
            </div>
          )}

          {habits.length === 0 && !showNew ? (
            <EmptyState title="Noch keine Habits" description="Tippe auf '+ Neu', um deinen ersten Gewohnheitstracker zu erstellen." />
          ) : (
            <div className="space-y-2">
              {habits.map(h => (
                <div key={h.id} className="bg-[var(--color-surface)] rounded-xl p-3">
                  {editingId === h.id ? (
                    <div className="flex gap-2 items-center">
                      <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEdit(h.id)} className="flex-1 bg-transparent border-b border-[var(--color-text)] pb-1 text-xs outline-none" autoFocus />
                      <button onClick={() => handleEdit(h.id)} className="text-[10px] font-semibold text-[var(--color-text)]">OK</button>
                      <button onClick={() => setEditingId(null)} className="text-[10px] text-[var(--color-text-secondary)]">Abbr.</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: h.color }}>{h.emoji}</div>
                      <span className="flex-1 text-xs">{h.name}</span>
                      <div className="flex items-center gap-2">
                        {streaks[h.id]?.current > 0 && <span className="text-[9px] text-[var(--color-text-secondary)]">{streaks[h.id].current}× / {streaks[h.id].longest}×</span>}
                        <button onClick={() => { setEditingId(h.id); setEditName(h.name) }} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]" aria-label={`${h.name} bearbeiten`}>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 8.5-8.5z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(h.id)} className="text-[#c4956a]" aria-label={`${h.name} löschen`}>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 text-center text-[10px] text-[var(--color-text-tertiary)]">
          Rhythm v0.1.0 · Alle Daten lokal gespeichert
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <p className="font-semibold text-base">{title}</p>
      <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-[220px]">{description}</p>
    </div>
  )
}
