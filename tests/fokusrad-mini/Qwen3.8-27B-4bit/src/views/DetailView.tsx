import { useState } from 'react'
import type { ReactElement } from 'react'
import { Trash2 } from 'lucide-react'
import type { FocusWheel } from '../types'
import { SEGMENT_COUNT, moodDeltaLabel } from '../types'
import { FocusWheelSvg } from '../components/FocusWheelSvg'
import { MoodShift } from '../components/MoodShift'
import { formatFullDate } from '../format'

interface DetailViewProps {
  wheel: FocusWheel
  onDelete: (id: string) => void
}

/**
 * Detailansicht eines abgeschlossenen Fokusrads: volles Rad, beide
 * Gedanken, alle acht Sätze, Stimmungs-Shift und Löschen mit
 * kurzer Bestätigung. (Der Zurück-Button sitzt im App-Kopf.)
 */
export function DetailView({ wheel, onDelete }: DetailViewProps): ReactElement {
  const [confirming, setConfirming] = useState(false)
  const shiftLabel = moodDeltaLabel(wheel.startMood, wheel.endMood)

  return (
    <div className="flex flex-col gap-4">
      <p className="pt-1 text-center text-[13px] tabular-nums" style={{ color: 'var(--ink-3)' }}>
        {formatFullDate(wheel.completedAt ?? wheel.createdAt)}
      </p>

      <div className="flex justify-center pt-1">
        <div className="w-full max-w-75">
          <FocusWheelSvg
            segments={wheel.segments}
            targetThought={wheel.targetThought}
            className="h-auto w-full"
            label={`Fokusrad: ${wheel.targetThought || 'ohne Zielgedanken'}`}
          />
        </div>
      </div>

      <section className="card flex flex-col items-center gap-3 p-5" aria-label="Stimmungs-Shift">
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
          Stimmung: {wheel.startMood} → {wheel.endMood ?? '–'}
        </h2>
        <MoodShift start={wheel.startMood} end={wheel.endMood} size="lg" />
        {shiftLabel !== null && (
          <p className="text-center text-[14px]" style={{ color: 'var(--ink-2)' }}>
            {shiftLabel}
          </p>
        )}
      </section>

      {(wheel.startThought.length > 0 || wheel.targetThought.length > 0) && (
        <section className="card p-5" aria-label="Gedanken">
          {wheel.startThought.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>
                Ausgangsgedanke
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--ink)' }}>
                {wheel.startThought}
              </p>
            </div>
          )}
          {wheel.targetThought.length > 0 && (
            <div className={wheel.startThought.length > 0 ? 'mt-4 border-t pt-4' : ''} style={{ borderColor: 'var(--line)' }}>
              <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>
                Zielgedanke
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--ink)' }}>
                {wheel.targetThought}
              </p>
            </div>
          )}
        </section>
      )}

      <section aria-label="Acht Gedanken" className="flex flex-col gap-2.5">
        {wheel.segments.slice(0, SEGMENT_COUNT).map((segment, index) => (
          <div key={index} className="card flex items-start gap-3 p-4">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
              style={{
                backgroundColor: `var(--wheel-${index + 1})`,
                color: 'var(--seg-num)',
                opacity: segment.trim().length > 0 ? 1 : 0.45
              }}
            >
              {index + 1}
            </span>
            <p className="min-w-0 flex-1 pt-1 text-[15px] leading-relaxed" style={{ color: 'var(--ink)' }}>
              {segment.trim().length > 0 ? segment : 'Ohne Gedanken'}
            </p>
          </div>
        ))}
      </section>

      {confirming ? (
        <div
          role="alertdialog"
          aria-label="Fokusrad löschen?"
          className="card rise-in p-5"
          style={{ borderColor: 'color-mix(in srgb, var(--danger) 45%, var(--line))' }}
        >
          <p className="text-[16px] font-semibold" style={{ color: 'var(--ink)' }}>
            Dieses Fokusrad löschen?
          </p>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ink-2)' }}>
            Der Eintrag und alle acht Gedanken werden entfernt.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="btn-ghost press" onClick={() => setConfirming(false)}>
              Behalten
            </button>
            <button
              type="button"
              onClick={() => onDelete(wheel.id)}
              className="press flex min-h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold"
              style={{ backgroundColor: 'var(--danger)', color: '#fdf6f1' }}
            >
              <Trash2 size={16} aria-hidden />
              Ja, löschen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn-ghost press w-full"
          style={{ color: 'var(--danger)', borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--line))' }}
        >
          <Trash2 size={16} aria-hidden />
          Eintrag löschen
        </button>
      )}

      <div className="safe-bottom h-2" />
    </div>
  )
}
