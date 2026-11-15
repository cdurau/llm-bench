import type { Mood } from '../types'
import { MOOD_LABELS } from '../types'

const MOODS: Mood[] = [1, 2, 3, 4, 5]

interface MoodScaleProps {
  label: string
  value: Mood
  onChange: (m: Mood) => void
}

/** Stimmungs-Skala 1–5 als tippbare Auswahl (44px+-Ziele, nicht Slider). */
export default function MoodScale({ label, value, onChange }: MoodScaleProps) {
  return (
    <div>
      <div role="group" aria-label={label} className="flex gap-2">
        {MOODS.map((m) => {
          const active = m === value
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(m)}
              className={`h-12 min-w-11 flex-1 rounded-xl border transition-[transform,border-color,background-color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <span className="sr-only">
                {m}: {MOOD_LABELS[m]}
              </span>
              <span aria-hidden="true" className="mx-auto flex flex-col items-center gap-1">
                <span className="text-[17px] font-semibold leading-none tabular-nums">{m}</span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: `var(--mood-${m})` }}
                />
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {MOOD_LABELS[value]} · 1 = sehr belastet, 5 = leicht und klar
      </p>
    </div>
  )
}
