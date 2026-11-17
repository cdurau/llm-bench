import { useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowRight, Check, History, Sparkles } from 'lucide-react'
import type { FocusWheel } from '../types'
import { FocusWheelSvg } from '../components/FocusWheelSvg'
import { MoodScale } from '../components/MoodScale'
import { MoodShift } from '../components/MoodShift'
import { WheelGlyph } from '../components/WheelGlyph'
import { clampMood, moodDeltaLabel } from '../types'

interface CompleteViewProps {
  /** Noch ohne End-Stimmung (Abschluss-Phase) oder das abgeschlossene Rad. */
  wheel: FocusWheel
  /** Wird auf „Abschließen" mit der gewählten End-Stimmung aufgerufen. */
  onCommit: (endMood: number) => void
  onGoToArchive: () => void
  onNewWheel: () => void
}

/**
 * Abschluss in zwei ruhigen Schritten:
 * 1. „Wie fühlst du dich jetzt?" – End-Stimmung wählen und abschließen.
 * 2. Das voll gefüllte Rad plus sichtbarer Stimmungs-Shift.
 */
export function CompleteView({
  wheel,
  onCommit,
  onGoToArchive,
  onNewWheel
}: CompleteViewProps): ReactElement {
  const [endMood, setEndMood] = useState(() => clampMood(wheel.endMood ?? wheel.startMood))
  const [phase, setPhase] = useState<'ask' | 'done'>(wheel.endMood === null ? 'ask' : 'done')
  const shiftLabel = moodDeltaLabel(wheel.startMood, wheel.endMood)

  if (phase === 'ask') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 pt-4 text-center">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              color: 'var(--accent)'
            }}
          >
            <Sparkles size={22} aria-hidden />
          </span>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--ink)' }}>
            Alle acht Gedanken stehen im Rad.
          </h1>
          <p className="max-w-65 text-[15px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
            Atme einmal durch – wie fühlst du dich jetzt, von 1 (belastet) bis 5 (ruhig)?
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-80 opacity-90">
            <FocusWheelSvg
              segments={wheel.segments}
              targetThought={wheel.targetThought}
              className="h-auto w-full"
              label={`Fokusrad, alle acht Gedanken eingetragen`}
            />
          </div>
        </div>

        <div className="card p-5">
          <span
            className="mb-4 block text-center text-[15px] font-semibold"
            style={{ color: 'var(--ink)' }}
          >
            End-Stimmung
          </span>
          <MoodScale value={endMood} onChange={setEndMood} label="End-Stimmung" />
        </div>

        <div className="action-dock -mx-4 px-4 py-3">
          <div className="card p-4">
            <button
              type="button"
              className="btn-primary press w-full"
              onClick={() => {
                onCommit(endMood)
                setPhase('done')
              }}
            >
              <Check size={18} aria-hidden />
              Fokusrad abschließen
            </button>
            <p className="mt-3 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
              Dein Rad wird in den Verlauf gelegt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            color: 'var(--accent)'
          }}
        >
          <Sparkles size={22} aria-hidden />
        </span>
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--ink)' }}>
          Dein Rad ist voll.
        </h1>
        <p className="max-w-65 text-[15px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
          Acht Gedanken stehen nun rund um das Gefühl, das du haben wolltest.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="pop-in w-full max-w-80">
          <FocusWheelSvg
            segments={wheel.segments}
            targetThought={wheel.targetThought}
            className="h-auto w-full"
            label={`Abgeschlossenes Fokusrad: ${wheel.targetThought || 'ohne Zielgedanken'}`}
          />
        </div>
      </div>

      <section
        className="card rise-in flex flex-col items-center gap-3 p-6"
        aria-label="Stimmungs-Shift"
      >
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
          Stimmung: {wheel.startMood} → {wheel.endMood ?? '–'}
        </h2>
        <MoodShift start={wheel.startMood} end={wheel.endMood} size="lg" />
        {shiftLabel !== null && (
          <p className="text-center text-[14px]" style={{ color: 'var(--ink-2)' }}>
            {shiftLabel}
          </p>
        )}
      </section>

      <section className="card p-5">
        <h3
          className="mb-2 text-[14px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--ink-3)' }}
        >
          Dein Weg
        </h3>
        <dl className="flex flex-col gap-3 text-[15px]">
          {wheel.startThought.length > 0 && (
            <div>
              <dt className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
                Ausgangsgedanke
              </dt>
              <dd className="mt-0.5 leading-relaxed" style={{ color: 'var(--ink)' }}>
                {wheel.startThought}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
              Zielgedanke
            </dt>
            <dd className="mt-0.5 leading-relaxed" style={{ color: 'var(--ink)' }}>
              {wheel.targetThought}
            </dd>
          </div>
        </dl>
      </section>

      <div className="action-dock -mx-4 px-4 py-3">
        <div className="card flex flex-col gap-3 p-4">
          <button type="button" onClick={onGoToArchive} className="btn-primary press w-full">
            <History size={18} aria-hidden />
            Im Verlauf ansehen
          </button>
          <button type="button" onClick={onNewWheel} className="btn-ghost press w-full">
            <WheelGlyph size={18} className="shrink-0" />
            Neues Fokusrad
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
