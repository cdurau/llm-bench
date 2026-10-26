import { useEffect, useRef, useState } from 'react'
import { MOODS } from '../lib/colors'
import { cn } from '../lib/cn'
import { useRhythm } from '../store'

interface MoodCheckinProps {
  date: string
}

export function MoodCheckin({ date }: MoodCheckinProps) {
  const { moodFor, saveMood, clearMood } = useRhythm()
  const entry = moodFor(date)
  const [note, setNote] = useState(entry?.note ?? '')
  const [selected, setSelected] = useState<number | undefined>(entry?.mood)

  const noteRef = useRef(note)
  const selectedRef = useRef(selected)
  useEffect(() => {
    noteRef.current = note
    selectedRef.current = selected
  }, [note, selected])

  useEffect(() => {
    setNote(moodFor(date)?.note ?? '')
    setSelected(moodFor(date)?.mood)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => {
    return () => {
      const mood = selectedRef.current
      if (mood) void saveMood(date, mood, noteRef.current)
    }
  }, [date, saveMood])

  async function handleSelect(value: number) {
    setSelected(value)
    await saveMood(date, value, note)
  }

  function handleNoteChange(value: string) {
    setNote(value)
    if (selected) void saveMood(date, selected, value)
  }

  async function handleClear() {
    setSelected(undefined)
    setNote('')
    await clearMood(date)
  }

  return (
    <section className="card animate-rise p-5" aria-labelledby="mood-heading">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Stimmung
          </p>
          <h2 id="mood-heading" className="display mt-1 text-xl text-ink">
            {selected ? 'Heute fühlst du dich:' : 'Wie fühlst du dich heute?'}
          </h2>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={() => void handleClear()}
            className="press min-h-11 rounded-lg px-2 text-xs text-faint hover:text-ink"
          >
            Zurücksetzen
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {MOODS.map((mood) => {
          const active = selected === mood.value
          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => void handleSelect(mood.value)}
              aria-pressed={active}
              aria-label={`Stimmung ${mood.label}`}
              className={cn(
                'press flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-2xl border',
                active
                  ? 'border-accent bg-accent-soft'
                  : 'border-transparent bg-elevated hover:border-line',
              )}
            >
              <span className={cn('text-2xl', active && 'animate-pop')} aria-hidden="true">
                {mood.emoji}
              </span>
              <span
                className={cn(
                  'text-[0.625rem] leading-none',
                  active ? 'text-accent-strong' : 'text-faint',
                )}
              >
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>

      {selected ? (
        <div className="animate-fade mt-4">
          <label
            htmlFor="mood-note"
            className="text-xs font-medium uppercase tracking-[0.08em] text-muted"
          >
            Kurznotiz <span className="normal-case tracking-normal text-faint">(optional)</span>
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(event) => handleNoteChange(event.target.value)}
            onBlur={() => void saveMood(date, selected, note)}
            rows={2}
            maxLength={280}
            placeholder="Eine kurze Notiz zu heute …"
            className="mt-2 w-full resize-none rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
      ) : null}
    </section>
  )
}