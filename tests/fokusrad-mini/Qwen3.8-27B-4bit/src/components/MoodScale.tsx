import type { ReactElement } from 'react'
import { MOOD_LABELS, clampMood } from '../types'

interface MoodScaleProps {
  value: number
  onChange: (mood: number) => void
  /** Label für Screenreader, z. B. „Start-Stimmung". */
  label: string
  /** Das beschreibende Wort unter der Skala zeigen (Standard: ja). */
  showCaption?: boolean
  className?: string
}

const MOODS = [1, 2, 3, 4, 5] as const

/**
 * Fünf-Punkte-Stimmungsskala: fünf 44-px-Touch-Ziele, die sich bei
 * Auswahl mit ihrer eigenen Stimmungsfarbe füllen (CSS-Variablen
 * `--mood-1` … `--mood-5`).
 */
export function MoodScale({
  value,
  onChange,
  label,
  showCaption = true,
  className
}: MoodScaleProps): ReactElement {
  const safe = clampMood(value)
  return (
    <div className={className}>
      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-5 gap-2"
      >
        {MOODS.map((mood) => {
          const selected = mood === safe
          return (
            <button
              key={mood}
              type="button"
              aria-pressed={selected}
              aria-label={`${label}: ${mood} von 5 (${MOOD_LABELS[mood - 1]})`}
              onClick={() => onChange(mood)}
              className="press chip flex h-11 w-11 items-center justify-center rounded-full border text-[16px] font-semibold"
              style={{
                backgroundColor: selected
                  ? `var(--mood-${mood})`
                  : 'var(--surface-2)',
                color: selected
                  ? `var(--mood-num-${mood})`
                  : 'var(--ink-2)',
                borderColor: selected ? 'transparent' : 'var(--line)',
                boxShadow: selected
                  ? '0 8px 18px -8px rgb(var(--shadow) / 0.6)'
                  : undefined
              }}
            >
              {mood}
            </button>
          )
        })}
      </div>
      {showCaption && (
        <p
          aria-live="polite"
          className="mt-3 text-center text-[15px] font-medium"
          style={{ color: 'var(--ink-2)' }}
        >
          {MOOD_LABELS[safe - 1]}
        </p>
      )}
    </div>
  )
}
