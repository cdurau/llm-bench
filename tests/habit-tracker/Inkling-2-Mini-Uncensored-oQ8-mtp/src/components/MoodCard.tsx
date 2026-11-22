import { useEffect, useState } from 'react'
import { MOODS, moodLabel } from '../lib/mood'
import type { MoodEntry } from '../types'

interface Props {
  mood: MoodEntry | undefined
  resolvedTheme: 'light' | 'dark'
  onSelect: (mood: 1 | 2 | 3 | 4 | 5) => void
  onSaveNote: (note: string) => void
  onClear: () => void
}

export default function MoodCard({ mood, resolvedTheme, onSelect, onSaveNote, onClear }: Props) {
  const [note, setNote] = useState(mood?.note ?? '')

  useEffect(() => {
    setNote(mood?.note ?? '')
  }, [mood?.note])

  const selected = mood?.mood ?? null

  return (
    <section aria-label="Stimmung" className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6862] dark:text-[#A39E94]">
          Stimmung heute
        </h2>
        {selected != null && (
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.06em] px-2.5 py-1 rounded-full"
            style={{
              color: resolvedTheme === 'dark' ? '#E8A87C' : '#A8431F',
              backgroundColor: resolvedTheme === 'dark' ? 'rgba(232,168,124,0.14)' : '#FDF0E9'
            }}
          >
            {moodLabel(selected)}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2" role="group" aria-label="Stimmung wählen">
        {MOODS.map((m) => {
          const active = selected === m.value
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onSelect(m.value)}
              aria-pressed={active}
              aria-label={`Stimmung ${m.value} von 5: ${m.label}`}
              title={m.label}
              className={`min-h-[52px] rounded-xl border text-[26px] leading-none inline-flex items-center justify-center transition-all duration-200 active:scale-95 ${
                active
                  ? 'border-[#A8431F] dark:border-[#E8A87C] bg-[#FDF0E9] dark:bg-[rgba(232,168,124,0.14)] scale-[1.03]'
                  : 'border-[#8E8A84] dark:border-[#78736C] bg-[#F9F9F8] dark:bg-[#262522] hover:border-[#8E8A84] dark:hover:border-[#78736C]'
              }`}
            >
              <span aria-hidden="true">{m.emoji}</span>
            </button>
          )
        })}
      </div>

      {selected != null && (
        <div className="mt-4 fade-in">
          <label htmlFor="mood-note" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6862] dark:text-[#A39E94] mb-1.5">
            Kurznotiz <span className="normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="mood-note"
              value={note}
              rows={2}
              maxLength={140}
              placeholder="Wie geht es dir?"
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => onSaveNote(note)}
              className="flex-1 resize-none rounded-lg border border-[#8E8A84] dark:border-[#78736C] bg-[#F9F9F8] dark:bg-[#262522] px-3 py-2.5 text-[15px] text-[#2F3437] dark:text-[#EDEAE4] placeholder:text-[#6B6862] dark:placeholder:text-[#A39E94] focus:outline-none focus:border-[#A8431F] dark:focus:border-[#E8A87C] transition-colors"
            />
            <button
              type="button"
              onClick={() => onSaveNote(note)}
              className="min-h-11 px-4 rounded-md bg-[#111111] dark:bg-[#EDEAE4] text-white dark:text-[#171614] text-[14px] font-semibold tracking-tight transition-all hover:bg-[#2A2A2A] dark:hover:bg-[#F4F2EE] active:scale-[0.98]"
            >
              Speichern
            </button>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="mt-2 text-[12px] font-medium text-[#6B6862] dark:text-[#A39E94] hover:text-[#A8431F] dark:hover:text-[#E8A87C] transition-colors min-h-8 px-1"
          >
            Stimmung entfernen
          </button>
        </div>
      )}
    </section>
  )
}
