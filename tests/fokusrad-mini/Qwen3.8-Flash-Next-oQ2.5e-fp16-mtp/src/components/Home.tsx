import ArchiveList from './ArchiveList'
import BottomBar from './BottomBar'
import FocusWheelSvg from './FocusWheelSvg'
import { SEGMENT_COUNT } from '../types'
import type { FocusWheel, WheelDraft } from '../types'

// Dekorativer Beispiel-Zustand für den Erststart-Leerzustand (4 Segmente gefüllt).
const SAMPLE_THOUGHTS = [
  'Ich atme einmal durch.',
  'Die Sache darf heute offen bleiben.',
  'Ein einziger kleiner Schritt genügt.',
  'Morgen früh ist der Kopf klarer.',
  '',
  '',
  '',
  '',
]

interface HomeProps {
  wheels: FocusWheel[]
  draft: WheelDraft | null
  onStart: () => void
  onResume: () => void
  onOpen: (id: string) => void
}

export default function Home({ wheels, draft, onStart, onResume, onOpen }: HomeProps) {
  const isFirstStart = wheels.length === 0 && !draft
  const filledCount = draft ? draft.thoughts.filter((t) => t.trim().length > 0).length : 0

  return (
    <div className="animate-rise pb-6">
      {isFirstStart && (
        <section className="pt-6 text-center">
          <FocusWheelSvg
            thoughts={SAMPLE_THOUGHTS}
            targetThought="leicht und klar"
            className="mx-auto w-full max-w-[220px]"
          />
          <h2 className="mt-6 text-xl leading-snug font-semibold tracking-tight text-ink">
            Der nächste Gedanke darf leichter werden.
          </h2>
          <p className="mx-auto mt-3 max-w-[48ch] text-[16px] leading-relaxed text-ink-soft">
            Fokusrad ist ein 5-Minuten-Gedanken-Shift: notiere, was drückt, wähle ein Zielgefühl
            und trage acht entlastende Sätze ein. Das Rad füllt sich Segment für Segment – alles
            offline auf deinem Gerät gespeichert.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-8 h-12 w-full"
            onClick={onStart}
          >
            Neues Fokusrad starten
          </button>
        </section>
      )}

      {draft && (
        <section className="card animate-rise mt-6">
          <h2 className="text-[16px] font-semibold text-ink">Laufende Session</h2>
          <p className="mt-2 text-sm leading-snug text-ink-soft line-clamp-2">
            Zielgedanke: {draft.targetThought}
          </p>
          <p className="mt-2 text-sm text-ink tabular-nums">
            {filledCount} von {SEGMENT_COUNT} Gedanken
          </p>
          <button type="button" className="btn btn-primary mt-4 h-12 w-full" onClick={onResume}>
            Session fortsetzen
          </button>
        </section>
      )}

      {wheels.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-ink-soft">
            Archiv · {wheels.length} {wheels.length === 1 ? 'Fokusrad' : 'Fokusräder'}
          </h2>
          <ArchiveList wheels={wheels} onOpen={onOpen} />
        </section>
      ) : (
        draft && (
          <p className="mt-8 text-sm text-ink-soft">
            Noch keine abgeschlossenen Fokusräder – schließe deine laufende Session ab, und sie
            erscheint hier.
          </p>
        )
      )}

      <BottomBar>
        <button
          type="button"
          className="btn btn-primary h-12 w-full"
          onClick={draft ? onResume : onStart}
        >
          {draft ? 'Session fortsetzen' : 'Neues Fokusrad'}
          {!draft && (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </button>
      </BottomBar>
    </div>
  )
}
