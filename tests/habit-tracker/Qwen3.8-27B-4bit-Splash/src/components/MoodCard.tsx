import { useState } from 'react'
import { todayKey } from '../lib/dates'
import type { MoodValue } from '../lib/db'
import { MOODS } from '../lib/palette'
import { useApp } from '../state/AppProvider'

/** Stimmung des Tages: 1–5 per Tap, optional Kurznotiz. */
export function MoodCard() {
  const { moods, setMood } = useApp()
  const today = todayKey()
  const entry = moods.find((m) => m.date === today)
  const [draftNote, setDraftNote] = useState(entry?.note ?? '')

  const pick = (value: MoodValue) => {
    void setMood(today, value, draftNote.trim())
  }

  const commitNote = () => {
    if (entry) {
      void setMood(today, entry.value, draftNote.trim())
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5" aria-label="Stimmung">
      <header className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
          Stimmung
        </h2>
        {entry ? (
          <span className="text-xs text-ink-faint">
            <span aria-hidden="true">{MOODS[entry.value - 1].emoji}</span> {MOODS[entry.value - 1].label}
          </span>
        ) : (
          <span className="text-xs text-ink-faint">Noch keine für heute</span>
        )}
      </header>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {MOODS.map((mood) => {
          const selected = entry?.value === mood.value
          return (
            <button
              key={mood.value}
              type="button"
              aria-pressed={selected}
              aria-label={`Stimmung ${mood.value} von 5: ${mood.label}`}
              onClick={() => pick(mood.value)}
              className={`flex h-12 items-center justify-center rounded-xl border text-2xl transition-colors ${
                selected ? 'border-line bg-sunken' : 'border-transparent'
              }`}
            >
              <span aria-hidden="true">{mood.emoji}</span>
            </button>
          )
        })}
      </div>

      <input
        value={draftNote}
        onChange={(event) => setDraftNote(event.target.value)}
        onBlur={commitNote}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitNote()
            event.currentTarget.blur()
          }
        }}
        placeholder="Kurznotiz (optional)"
        aria-label="Kurznotiz zur heutigen Stimmung"
        maxLength={120}
        className="mt-4 h-11 w-full rounded-lg border border-line bg-sunken/60 px-3.5 text-sm text-ink placeholder:text-ink-faint"
      />
    </section>
  )
}
