import type { ReactElement } from 'react'
import { ArrowRight } from 'lucide-react'
import { clampMood } from '../types'

interface MoodShiftProps {
  start: number
  end: number | null
  /** `lg` für den Abschlussbildschirm, `sm` für Listenzeilen. */
  size?: 'sm' | 'lg'
}

/**
 * Visualisiert den Stimmungs-Shift: Start- und End-Punkt in ihren
 * Stimmungsfarben, verbunden durch eine Pfeil-Richtung.
 */
export function MoodShift({ start, end, size = 'sm' }: MoodShiftProps): ReactElement | null {
  if (end === null) return null
  const s = clampMood(start)
  const e = clampMood(end)

  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold tabular-nums">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `var(--mood-${s})` }}
        />
        {s}
        <ArrowRight size={13} className="shrink-0" style={{ color: 'var(--ink-3)' }} aria-hidden />
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `var(--mood-${e})` }}
        />
        {e}
      </span>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4" aria-live="polite">
      <span
        className="pop-in flex h-16 w-16 items-center justify-center rounded-full text-[24px] font-bold"
        style={{ backgroundColor: `var(--mood-${s})`, color: `var(--mood-num-${s})` }}
      >
        {s}
      </span>
      <ArrowRight size={26} style={{ color: 'var(--ink-2)' }} aria-hidden />
      <span
        className="pop-in flex h-16 w-16 items-center justify-center rounded-full text-[24px] font-bold"
        style={{
          backgroundColor: `var(--mood-${e})`,
          color: `var(--mood-num-${e})`,
          animationDelay: '140ms',
          boxShadow: '0 14px 30px -12px rgb(var(--shadow) / 0.55)'
        }}
      >
        {e}
      </span>
    </div>
  )
}
