import { useState, type CSSProperties } from 'react'
import { MOOD_LEVELS, moodByValue } from '../lib/palette'
import { todayKey } from '../lib/dates'
import { useRhythm } from '../store'

/** Stimmung: einmal pro Tag von 1–5 wählbar, mit optionaler Kurznotiz. */
export function MoodCard() {
  const { moods, setMood } = useRhythm()
  const today = todayKey()
  const entry = moods.find((m) => m.date === today)
  const [note, setNote] = useState(entry?.note ?? '')
  const [savedNote, setSavedNote] = useState(entry?.note ?? '')

  async function pick(value: number) {
    await setMood(today, value, note)
    setSavedNote(note)
  }

  async function saveNote() {
    if (!entry) return
    await setMood(today, entry.value, note)
    setSavedNote(note)
  }

  const dirty = entry !== undefined && note.trim() !== savedNote

  return (
    <section
      aria-label="Stimmung heute"
      className="rise rounded-card border border-line bg-surface p-5 shadow-soft"
      style={{ '--index': 1 } as CSSProperties}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">Wie geht es dir heute?</h2>
        {entry ? (
          <span className="rounded-full bg-clay-soft px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-clay">
            {moodByValue(entry.value).emoji} {moodByValue(entry.value).label}
          </span>
        ) : (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
            Noch offen
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-between" role="group" aria-label="Stimmung von 1 bis 5 wählen">
        {MOOD_LEVELS.map((level) => {
          const selected = entry?.value === level.value
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => void pick(level.value)}
              aria-pressed={selected}
              aria-label={`Stimmung ${level.value} von 5 – ${level.label}`}
              title={level.label}
              className={
                'grid h-12 w-12 place-items-center rounded-full border text-[22px] leading-none transition-transform duration-200 ' +
                (selected
                  ? 'scale-110 border-ink bg-canvas'
                  : 'border-line hover:border-line-strong active:scale-95')
              }
            >
              <span aria-hidden="true">{level.emoji}</span>
            </button>
          )
        })}
      </div>

      {entry ? (
        <div className="mt-4 border-t border-line pt-4">
          <label
            htmlFor="mood-note"
            className="text-xs font-medium tracking-[0.05em] text-muted uppercase"
          >
            Notiz
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && dirty) void saveNote()
              }}
              placeholder="Optional, z. B. „Konzentrierter Tag“"
              autoComplete="off"
              className="h-10 min-w-0 flex-1 rounded-[10px] border border-line bg-canvas px-3 text-sm text-ink outline-none placeholder:text-faint focus-visible:border-ink/50"
            />
            {dirty ? (
              <button
                type="button"
                onClick={() => void saveNote()}
                className="min-h-10 shrink-0 rounded-[6px] bg-ink px-3.5 text-sm font-medium text-canvas active:scale-[0.98]"
              >
                Speichern
              </button>
            ) : (
              <span className="flex shrink-0 items-center px-1 text-xs text-faint">Gespeichert</span>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-faint">
          Tippe auf das Symbol, das heute am ehesten passt.
        </p>
      )}
    </section>
  )
}
