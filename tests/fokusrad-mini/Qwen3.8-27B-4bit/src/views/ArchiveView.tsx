import type { ReactElement } from 'react'
import { ChevronRight } from 'lucide-react'
import type { FocusWheel } from '../types'
import { FocusWheelSvg } from '../components/FocusWheelSvg'
import { MoodShift } from '../components/MoodShift'
import { WheelGlyph } from '../components/WheelGlyph'
import { formatListDate } from '../format'

interface ArchiveViewProps {
  wheels: FocusWheel[]
  onOpenWheel: (id: string) => void
  onStartNew: () => void
}

/**
 * Verlauf aller abgeschlossenen Fokusräder: Datum, Ausgangs- und
 * Zielgedanke sowie der Stimmungs-Shift. Antippen öffnet die Detailansicht.
 */
export function ArchiveView({ wheels, onOpenWheel, onStartNew }: ArchiveViewProps): ReactElement {
  if (wheels.length === 0) {
    return (
      <section className="card rise-in flex flex-col items-center gap-4 p-8 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
        >
          <WheelGlyph size={52} />
        </div>
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: 'var(--ink)' }}>
            Noch keine abgeschlossenen Fokusräder
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
            Wenn du dein erstes Rad abschließt, findest du es hier – mit Datum, Gedanken und
            Stimmungs-Shift.
          </p>
        </div>
        <button type="button" onClick={onStartNew} className="btn-primary press w-full">
          Ersten Fokusrad starten
        </button>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {wheels.map((wheel) => {
        const date = wheel.completedAt !== null ? wheel.completedAt : wheel.createdAt
        return (
          <button
            key={wheel.id}
            type="button"
            onClick={() => onOpenWheel(wheel.id)}
            aria-label={`Fokusrad vom ${formatListDate(date)} öffnen`}
            className="card press flex w-full items-center gap-3 p-4 text-left"
          >
            <div className="w-14 shrink-0">
              <FocusWheelSvg
                size={56}
                targetThought={wheel.targetThought}
                segments={wheel.segments}
                showNumbers={false}
                label=""
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] tabular-nums" style={{ color: 'var(--ink-3)' }}>
                {formatListDate(date)}
              </p>
              <p
                className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug"
                style={{ color: 'var(--ink)' }}
              >
                {wheel.startThought.length > 0 ? wheel.startThought : 'Ohne Ausgangsgedanken'}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <MoodShift start={wheel.startMood} end={wheel.endMood} />
                {wheel.targetThought.length > 0 && (
                  <span className="truncate text-[13px]" style={{ color: 'var(--ink-2)' }}>
                    → {wheel.targetThought}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={20} className="shrink-0" style={{ color: 'var(--ink-3)' }} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
