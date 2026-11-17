import { useId, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { ArrowRight } from 'lucide-react'
import { MoodScale } from '../components/MoodScale'

interface NewWheelViewProps {
  onStart: (startThought: string, targetThought: string, startMood: number) => void
}

/**
 * Eingang einer neuen Session: Ausgangsgedanke, Zielgedanke und
 * Start-Stimmung. Der Start-Button sitzt unten in der Thumb-Zone.
 */
export function NewWheelView({ onStart }: NewWheelViewProps): ReactElement {
  const formId = useId()
  const [startThought, setStartThought] = useState('')
  const [targetThought, setTargetThought] = useState('')
  const [startMood, setStartMood] = useState(3)

  const ready = startThought.trim().length > 0 && targetThought.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready) return
    onStart(startThought.trim(), targetThought.trim(), startMood)
    setStartThought('')
    setTargetThought('')
    setStartMood(3)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="card p-5">
        <label
          htmlFor={`${formId}-start`}
          className="mb-2 block text-[15px] font-semibold"
          style={{ color: 'var(--ink)' }}
        >
          Ausgangsgedanke
        </label>
        <p className="mb-3 text-[14px]" style={{ color: 'var(--ink-2)' }}>
          Was stört oder drückt gerade? Ein Gedanke, eine Sorge, ein Gefühl.
        </p>
        <textarea
          id={`${formId}-start`}
          className="field resize-none"
          rows={3}
          maxLength={1000}
          placeholder="z. B. „Ich habe das Gefühl, alles gleichzeitig machen zu müssen.“"
          value={startThought}
          onChange={(event) => setStartThought(event.target.value)}
        />
      </div>

      <div className="card p-5">
        <label
          htmlFor={`${formId}-target`}
          className="mb-2 block text-[15px] font-semibold"
          style={{ color: 'var(--ink)' }}
        >
          Zielgedanke
        </label>
        <p className="mb-3 text-[14px]" style={{ color: 'var(--ink-2)' }}>
          Wie möchtest du dich stattdessen fühlen? Er steht im Zentrum deines Rads.
        </p>
        <textarea
          id={`${formId}-target`}
          className="field resize-none"
          rows={2}
          maxLength={500}
          placeholder="z. B. „Ich darf nach und nach.“"
          value={targetThought}
          onChange={(event) => setTargetThought(event.target.value)}
        />
      </div>

      <div className="card p-5">
        <span
          className="mb-1 block text-[15px] font-semibold"
          style={{ color: 'var(--ink)' }}
        >
          Start-Stimmung
        </span>
        <p className="mb-4 text-[14px]" style={{ color: 'var(--ink-2)' }}>
          Wo stehst du gerade – von 1 (belastet) bis 5 (ruhig)?
        </p>
        <MoodScale value={startMood} onChange={setStartMood} label="Start-Stimmung" />
      </div>

      <div className="action-dock action-dock--nav -mx-4 px-4 py-3">
        <div className="card p-4">
          <button
            type="submit"
            disabled={!ready}
            className="btn-primary press w-full"
          >
            Fokusrad starten
            <ArrowRight size={18} aria-hidden />
          </button>
          <p className="mt-3 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Dauer: 5 Minuten · alles bleibt auf diesem Gerät
          </p>
        </div>
      </div>
    </form>
  )
}
