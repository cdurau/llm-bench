import { useState } from 'react'
import BottomBar from './BottomBar'
import FocusWheelSvg from './FocusWheelSvg'
import MoodScale from './MoodScale'
import { MOOD_LABELS, SEGMENT_COUNT } from '../types'
import type { FocusWheel, Mood, WheelDraft } from '../types'

type Phase = 'fill' | 'close' | 'done'

const BRIDGE_HINT =
  'Ein Satz, der entlastet und vertraut wirkt – eine kleine Brücke vom Ausgangs- zum Zielgedanken. Kein forciertes Wunschdenken, dem dein Kopf misstraut.'

interface ActiveSessionProps {
  draft: WheelDraft
  onUpdate: (draft: WheelDraft) => void
  onFinish: (wheel: FocusWheel) => void
  onDiscard: () => void
  onSeeArchive: () => void
}

/** Laufende Fokusrad-Session: Start → 8 Sätze → Abschluss mit Stimmungs-Shift. */
export default function ActiveSession({
  draft,
  onUpdate,
  onFinish,
  onDiscard,
  onSeeArchive,
}: ActiveSessionProps) {
  const [phase, setPhase] = useState<Phase>('fill')
  const [currentInput, setCurrentInput] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [endMood, setEndMood] = useState<Mood>(draft.startMood)
  const [discarding, setDiscarding] = useState(false)
  const [doneWheel, setDoneWheel] = useState<FocusWheel | null>(null)

  const filledCount = draft.thoughts.filter((t) => t.trim().length > 0).length
  const currentIndex = draft.thoughts.findIndex((t) => t.trim().length === 0)
  const allFilled = currentIndex === -1

  const setThought = (index: number, value: string) => {
    const thoughts = draft.thoughts.slice()
    thoughts[index] = value.trim().slice(0, 400)
    onUpdate({ ...draft, thoughts })
  }

  const addThought = () => {
    const trimmed = currentInput.trim()
    if (!trimmed || currentIndex === -1) return
    setThought(currentIndex, trimmed)
    setCurrentInput('')
  }

  const saveEdit = () => {
    if (editIndex === null || editText.trim().length === 0) return
    setThought(editIndex, editText)
    setEditIndex(null)
    setEditText('')
  }

  const finish = () => {
    const wheel: FocusWheel = {
      id: draft.id,
      createdAt: draft.createdAt,
      completedAt: new Date().toISOString(),
      initialThought: draft.initialThought,
      targetThought: draft.targetThought,
      startMood: draft.startMood,
      endMood,
      thoughts: draft.thoughts.map((t) => t.trim()),
    }
    setDoneWheel(wheel)
    onFinish(wheel)
    setPhase('done')
  }

  const done = doneWheel ?? draft
  const delta = doneWheel ? doneWheel.endMood - doneWheel.startMood : 0

  return (
    <div className="animate-rise pb-6">
      <FocusWheelSvg
        thoughts={done.thoughts}
        targetThought={done.targetThought}
        activeIndex={phase === 'fill' ? currentIndex : null}
        glow={allFilled || phase !== 'fill'}
        className="mx-auto mt-6 w-full max-w-[300px]"
      />

      <p className="mt-4 text-center text-[16px] font-semibold text-ink tabular-nums">
        {done.thoughts.filter((t) => t.trim().length > 0).length} von {SEGMENT_COUNT} Gedanken
      </p>
      <div aria-hidden="true" className="mx-auto mt-2 flex justify-center gap-1.5">
        {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
              done.thoughts[i]?.trim() ? 'bg-accent' : 'bg-line'
            }`}
          />
        ))}
      </div>

      {phase === 'fill' && currentIndex >= 0 && (
        <section key={currentIndex} className="card animate-rise mt-6">
          <h2 className="text-[16px] font-semibold text-ink">
            Gedanke {currentIndex + 1} von {SEGMENT_COUNT}
          </h2>
          <p className="mt-1 mb-3 text-sm leading-relaxed text-ink-soft">{BRIDGE_HINT}</p>
          <label className="sr-only" htmlFor="satz-eingabe">
            Überbrückenden Satz für Segment {currentIndex + 1} eingeben
          </label>
          <textarea
            id="satz-eingabe"
            className="input"
            rows={3}
            maxLength={400}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="z. B. „Ich darf die Sache heute offen lassen.“"
          />
          <button
            type="button"
            className="btn btn-primary mt-3 w-full"
            disabled={currentInput.trim().length === 0}
            onClick={addThought}
          >
            Satz eintragen
          </button>
        </section>
      )}

      {phase === 'fill' && allFilled && (
        <section className="card animate-rise mt-6">
          <h2 className="text-[16px] font-semibold text-ink">Alle acht Gedanken sind im Rad.</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Das Rad darf sich schließen. Im letzten Schritt fragst du ab, wie es sich jetzt anfühlt
            – und der Shift wird sichtbar.
          </p>
        </section>
      )}

      {phase === 'close' && (
        <section className="card animate-rise mt-6">
          <h2 className="text-[16px] font-semibold text-ink">Wie fühlt sich jetzt?</h2>
          <p className="mt-1 mb-3 text-sm leading-relaxed text-ink-soft">
            Dein Start war {draft.startMood} („{MOOD_LABELS[draft.startMood]}“).
          </p>
          <MoodScale label="End-Stimmung" value={endMood} onChange={setEndMood} />
        </section>
      )}

      {phase === 'done' && doneWheel && (
        <section className="card animate-rise mt-6 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-ink">Shift geschafft.</h2>
          <p className="mt-3 text-2xl font-semibold tabular-nums">
            Stimmung: {doneWheel.startMood} <span aria-hidden="true">→</span> {doneWheel.endMood}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Von „{MOOD_LABELS[doneWheel.startMood]}“ zu „{MOOD_LABELS[doneWheel.endMood]}“ ·{' '}
            <span className="font-semibold text-accent">
              {delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : 'stabil'}
            </span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {delta === 0
              ? 'Keine Verschiebung – auch das ist erlaubt. Das Rad ist trotzdem komplett.'
              : delta > 0
                ? `${delta} ${delta === 1 ? 'Schritt' : 'Schritte'} Richtung leichter.`
                : `${Math.abs(delta)} ${delta === -1 ? 'Schritt' : 'Schritte'} zurück – auch okay.`}{' '}
            Das Fokusrad liegt jetzt im Archiv.
          </p>
        </section>
      )}

      {phase === 'fill' && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-ink-soft">
            Eingetragen in dieser Session
          </h2>
          <ul className="space-y-2">
            {draft.thoughts.map((t, i) => {
              if (!t.trim()) return null
              const editing = editIndex === i
              return (
                <li key={i} className="card">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-[16px] leading-relaxed text-ink">
                      <span className="mr-2 font-semibold text-accent tabular-nums">{i + 1}.</span>
                      {t}
                    </span>
                    {!editing && (
                      <button
                        type="button"
                        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 hover:text-ink hover:bg-surface-2 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={() => {
                          setEditIndex(i)
                          setEditText(t)
                        }}
                        aria-label={`Gedanke ${i + 1} bearbeiten`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                    )}
                  </span>
                  {editing && (
                    <div className="animate-rise mt-3">
                      <label className="sr-only" htmlFor={`bearbeitung-${i}`}>
                        Gedanke {i + 1} bearbeiten
                      </label>
                      <textarea
                        id={`bearbeitung-${i}`}
                        className="input"
                        rows={3}
                        maxLength={400}
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          className="btn btn-ghost w-auto shrink-0 px-5"
                          onClick={() => {
                            setEditIndex(null)
                            setEditText('')
                          }}
                        >
                          Abbrechen
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary flex-1"
                          disabled={editText.trim().length === 0}
                          onClick={saveEdit}
                        >
                          Speichern
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-8">
            {!discarding ? (
              <button
                type="button"
                className="btn btn-ghost w-full text-ink-soft"
                onClick={() => setDiscarding(true)}
              >
                Session verwerfen
              </button>
            ) : (
              <div className="card animate-rise">
                <p className="text-[16px] leading-relaxed text-ink">
                  Session wirklich verwerfen? Der bisherige Fortschritt geht verloren.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    className="btn btn-ghost w-auto shrink-0 px-6"
                    onClick={() => setDiscarding(false)}
                  >
                    Behalten
                  </button>
                  <button type="button" className="btn btn-primary" onClick={onDiscard}>
                    Wirklich verwerfen
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <BottomBar>
        {phase === 'fill' && !allFilled && (
          <p className="text-center text-sm text-ink-soft tabular-nums">
            noch {SEGMENT_COUNT - filledCount} {SEGMENT_COUNT - filledCount === 1 ? 'Gedanke' : 'Gedanken'} …
          </p>
        )}
        {phase === 'fill' && allFilled && (
          <button type="button" className="btn btn-primary w-full" onClick={() => setPhase('close')}>
            Rad abschließen
          </button>
        )}
        {phase === 'close' && (
          <button type="button" className="btn btn-primary w-full" onClick={finish}>
            Shift festhalten
          </button>
        )}
        {phase === 'done' && (
          <button type="button" className="btn btn-primary w-full" onClick={onSeeArchive}>
            Zum Archiv
          </button>
        )}
      </BottomBar>
    </div>
  )
}
