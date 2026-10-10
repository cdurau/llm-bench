import { useState, useEffect } from 'react'
import { useMood } from '../hooks'
import { getTodayStr } from '../db'

const MOODS = [
  { value: 1, emoji: '😔', label: 'Sehr schlecht' },
  { value: 2, emoji: '😕', label: 'Schlecht' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😊', label: 'Sehr gut' },
] as const

export default function MoodSection() {
  const { todayMood, save } = useMood()
  const [selected, setSelected] = useState<number | null>(todayMood?.value ?? null)
  const [note, setNote] = useState(todayMood?.note ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSelected(todayMood?.value ?? null)
    setNote(todayMood?.note ?? '')
    setSaved(false)
  }, [todayMood])

  const handleSave = () => {
    if (selected === null) return
    save({ date: getTodayStr(), value: selected, note: note.trim() || undefined })
    setSaved(true)
  }

  return (
    <section className="mt-2">
      <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
        Stimmung
      </h2>
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
        <div className="flex gap-2 mb-3">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelected(m.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all duration-150 touch-manipulation ${
                selected === m.value
                  ? 'bg-stone-100 dark:bg-stone-800'
                  : 'hover:bg-stone-50 dark:hover:bg-stone-950'
              }`}
              aria-label={m.label}
              aria-pressed={selected === m.value}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className={`text-xs ${selected === m.value ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400 dark:text-stone-600'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional: Notiz…"
          maxLength={200}
          className="w-full text-sm bg-transparent border-b border-stone-200 dark:border-stone-800 pb-1 text-stone-700 dark:text-stone-300 placeholder-stone-300 dark:placeholder-stone-700 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors mb-3"
        />
        <button
          onClick={handleSave}
          disabled={selected === null}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 touch-manipulation ${
            selected !== null
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-200'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed'
          }`}
        >
          {saved ? 'Gespeichert' : 'Speichern'}
        </button>
      </div>
    </section>
  )
}
