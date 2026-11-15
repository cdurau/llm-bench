import { useState } from 'react'
import FocusWheelSvg from './FocusWheelSvg'
import { formatDate, shiftBadge } from '../utils'
import { MOOD_LABELS } from '../types'
import type { FocusWheel } from '../types'

interface WheelDetailProps {
  wheel: FocusWheel
  onDelete: () => void
}

export default function WheelDetail({ wheel, onDelete }: WheelDetailProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="animate-rise pb-8">
      <FocusWheelSvg
        thoughts={wheel.thoughts}
        targetThought={wheel.targetThought}
        glow
        className="mx-auto mt-6 w-full max-w-[300px]"
      />

      <section className="card mt-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Stimmung: {wheel.startMood} <span aria-hidden="true">→</span> {wheel.endMood}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Von „{MOOD_LABELS[wheel.startMood]}“ zu „{MOOD_LABELS[wheel.endMood]}“ ·{' '}
          <span className="font-semibold text-accent">
            {shiftBadge(wheel.startMood, wheel.endMood)}
          </span>{' '}
          · {formatDate(wheel.completedAt)}
        </p>
      </section>

      <div className="mt-6 space-y-4">
        <section className="card">
          <h3 className="text-sm font-semibold text-ink-soft">Ausgangsgedanke</h3>
          <p className="mt-1 text-[16px] leading-relaxed text-ink">{wheel.initialThought}</p>
        </section>
        <section className="card">
          <h3 className="text-sm font-semibold text-ink-soft">Zielgedanke</h3>
          <p className="mt-1 text-[16px] leading-relaxed text-ink">{wheel.targetThought}</p>
        </section>
        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink-soft">Die 8 Gedanken</h3>
          <ol className="space-y-2">
            {wheel.thoughts.map((t, i) => (
              <li key={i} className="card flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-accent-soft text-center text-[12px] font-semibold leading-7 text-ink tabular-nums"
                >
                  {i + 1}
                </span>
                <span className="text-[16px] leading-relaxed text-ink">{t}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-8">
        {!confirming ? (
          <button
            type="button"
            className="btn btn-ghost w-full"
            onClick={() => setConfirming(true)}
          >
            Diesen Eintrag löschen
          </button>
        ) : (
          <div className="card animate-rise">
            <p className="text-[16px] leading-relaxed text-ink">
              Eintrag wirklich löschen? Das Fokusrad verschwindet aus dem Archiv.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="btn btn-ghost w-auto shrink-0 px-6"
                onClick={() => setConfirming(false)}
              >
                Behalten
              </button>
              <button type="button" className="btn btn-primary" onClick={onDelete}>
                Wirklich löschen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
