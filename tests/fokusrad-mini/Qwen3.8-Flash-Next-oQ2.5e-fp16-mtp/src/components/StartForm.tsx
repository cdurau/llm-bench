import { useState } from 'react'
import BottomBar from './BottomBar'
import MoodScale from './MoodScale'
import type { Mood } from '../types'

export interface WheelStartFields {
  initialThought: string
  targetThought: string
  startMood: Mood
}

interface StartFormProps {
  onStart: (fields: WheelStartFields) => void
  onCancel: () => void
}

/** Neues Fokusrad: Ausgangsgedanke, Zielgedanke, Start-Stimmung. */
export default function StartForm({ onStart, onCancel }: StartFormProps) {
  const [initial, setInitial] = useState('')
  const [target, setTarget] = useState('')
  const [mood, setMood] = useState<Mood>(3)
  const ready = initial.trim().length > 1 && target.trim().length > 1

  return (
    <div className="animate-rise pb-6">
      <p className="mt-6 text-[16px] leading-relaxed text-ink-soft">
        Zwei Notizen und ein Ausgangspunkt – mehr braucht dein Fokusrad nicht. Alles bleibt
        offline auf diesem Gerät.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <label htmlFor="feld-ausgang" className="block text-[16px] font-semibold text-ink">
            Ausgangsgedanke
          </label>
          <p className="mt-1 mb-3 text-sm leading-relaxed text-ink-soft">
            Was gerade stört oder drückt – einfach notieren, ohne Filter.
          </p>
          <textarea
            id="feld-ausgang"
            className="input"
            rows={3}
            maxLength={400}
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
            placeholder="z. B. „Ich hänge seit dem Morgen in einer Sache fest, die ich nicht klären kann.“"
          />
        </div>

        <div>
          <label htmlFor="feld-ziel" className="block text-[16px] font-semibold text-ink">
            Zielgedanke
          </label>
          <p className="mt-1 mb-3 text-sm leading-relaxed text-ink-soft">
            Wie ich mich stattdessen fühlen möchte – er steht später im Zentrum des Rads.
          </p>
          <textarea
            id="feld-ziel"
            className="input"
            rows={3}
            maxLength={400}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="z. B. „leicht und klar, mit einem offenen nächsten Schritt“"
          />
        </div>

        <div>
          <p className="mb-3 text-[16px] font-semibold text-ink">Wie belastet fühlst du dich gerade?</p>
          <MoodScale label="Start-Stimmung" value={mood} onChange={setMood} />
        </div>
      </div>

      <BottomBar>
        {!ready && (
          <p className="mb-2 text-center text-sm text-ink-soft">
            Bitte beide Gedanken eintragen, dann kann das Rad starten.
          </p>
        )}
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost w-auto shrink-0 px-6" onClick={onCancel}>
            Abbrechen
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1"
            disabled={!ready}
            onClick={() =>
              onStart({
                initialThought: initial.trim(),
                targetThought: target.trim(),
                startMood: mood,
              })
            }
          >
            Fokusrad starten
          </button>
        </div>
      </BottomBar>
    </div>
  )
}
