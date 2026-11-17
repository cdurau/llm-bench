import { useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowRight, Check, Play } from 'lucide-react'
import type { FocusWheel } from '../types'
import { filledSegmentCount } from '../types'
import { WheelGlyph } from '../components/WheelGlyph'
import { FocusWheelSvg } from '../components/FocusWheelSvg'
import { NewWheelView } from './NewWheelView'

interface HomeViewProps {
  /** Laufende Session (Entwurf), falls vorhanden. */
  draft: FocusWheel | null
  /** Abgeschlossene Räder (neueste zuerst) – für das Vorschaufeld. */
  wheels: FocusWheel[]
  onStart: (startThought: string, targetThought: string, startMood: number) => void
  onContinue: () => void
  onDiscardDraft: () => void
  onOpenArchive: () => void
}

/**
 * Startseite: einladender Begrüßungszustand, „Weitermachen"-Karte
 * für die laufende Session, das Formular für ein neues Fokusrad
 * sowie (ab dem zweiten Rad) die letzten beiden aus dem Verlauf.
 */
export function HomeView({
  draft,
  wheels,
  onStart,
  onContinue,
  onDiscardDraft,
  onOpenArchive
}: HomeViewProps): ReactElement {
  const formAnchorRef = useRef<HTMLDivElement>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const hasAnyWheel = wheels.length > 0
  const draftProgress = draft ? filledSegmentCount(draft) : 0
  const recent = wheels.slice(0, 2)

  const scrollToForm = () => {
    formAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- Begrüßung / Leerzustand ---------- */}
      {!hasAnyWheel && draft === null ? (
        <section className="card rise-in flex flex-col items-center gap-4 p-6 text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <WheelGlyph size={52} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold leading-snug" style={{ color: 'var(--ink)' }}>
              Hallo. Nimm dir fünf Minuten.
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
              Fokusrad hilft dir, von einem belastenden Gedanken zu dem Gefühl zu wechseln, das
              du stattdessen haben möchtest – in acht kleinen Schritten.
            </p>
          </div>
          <button type="button" onClick={scrollToForm} className="btn-primary press w-full">
            <Play size={18} aria-hidden />
            Erster Fokusrad starten
          </button>
          <p className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Kompletter Offline-Betrieb · deine Daten bleiben auf diesem Gerät
          </p>
        </section>
      ) : (
        <section className="rise-in">
          <h1 className="text-[20px] font-bold" style={{ color: 'var(--ink)' }}>
            Dein Fokusrad
          </h1>
          <p className="mt-1 text-[15px]" style={{ color: 'var(--ink-2)' }}>
            {hasAnyWheel
              ? `${wheels.length} ${wheels.length === 1 ? 'Rad abgeschlossen' : 'Räder abgeschlossen'}.`
              : 'Fünf Minuten, acht Gedanken, ein ruhigerer Kopf.'}
          </p>
        </section>
      )}

      {/* ---------- Laufende Session: Weitermachen ---------- */}
      {draft !== null && (
        <section
          aria-label="Laufende Session"
          className="card pop-in flex items-center gap-4 p-4"
          style={{
            borderColor: 'color-mix(in srgb, var(--accent) 45%, var(--line))',
            backgroundColor: 'color-mix(in srgb, var(--accent) 6%, var(--surface))'
          }}
        >
          <div className="w-20 shrink-0">
            <FocusWheelSvg
              size={80}
              targetThought={draft.targetThought}
              segments={draft.segments}
              showNumbers={false}
              label={`Laufendes Fokusrad: ${draftProgress} von 8 Gedanken`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-3)' }}>
              Weitermachen
            </p>
            <p className="mt-1 truncate text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
              {draft.targetThought.length > 0 ? draft.targetThought : 'Ohne Zielgedanken'}
            </p>
            <p className="mt-0.5 text-[13px]" style={{ color: 'var(--ink-2)' }}>
              {draftProgress} von 8 Gedanken
            </p>
            <button type="button" onClick={onContinue} className="btn-primary press mt-3 w-full">
              Session fortsetzen
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </section>
      )}

      {/* ---------- Neues Fokusrad ---------- */}
      <div ref={formAnchorRef} className="scroll-mt-20 pt-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
            Neues Fokusrad
          </h2>
        </div>
        <NewWheelView onStart={onStart} />
      </div>

      {/* ---------- Verwerfen-Dialog (klein, inline) ---------- */}
      {draft !== null && confirmDiscard && (
        <div
          role="alertdialog"
          aria-label="Session verwerfen?"
          className="card rise-in p-4"
          style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--line))' }}
        >
          <p className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
            Laufende Session verwerfen?
          </p>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ink-2)' }}>
            Die {draftProgress} eingetragenen Gedanken werden gelöscht. Das lässt sich nicht
            rückgängig machen.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-ghost press"
              onClick={() => setConfirmDiscard(false)}
            >
              Behalten
            </button>
            <button
              type="button"
              className="press flex min-h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold"
              style={{ backgroundColor: 'var(--danger)', color: '#fdf6f1' }}
              onClick={() => {
                setConfirmDiscard(false)
                onDiscardDraft()
              }}
            >
              <Check size={16} aria-hidden />
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {draft !== null && !confirmDiscard && (
        <button
          type="button"
          onClick={() => setConfirmDiscard(true)}
          className="press mx-auto text-[13px] underline underline-offset-4"
          style={{ color: 'var(--ink-3)' }}
        >
          Laufende Session verwerfen
        </button>
      )}

      {/* ---------- Letztes aus dem Verlauf ---------- */}
      {recent.length > 0 && (
        <section aria-label="Letzte Fokusräder">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
              Zuletzt
            </h2>
            <button
              type="button"
              onClick={onOpenArchive}
              className="press text-[14px] font-semibold underline underline-offset-4"
              style={{ color: 'var(--accent)' }}
            >
              Alle ansehen
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {recent.map((wheel) => (
              <div key={wheel.id} className="card flex items-center gap-3 p-4">
                <div className="w-14 shrink-0">
                  <FocusWheelSvg
                    size={56}
                    targetThought={wheel.targetThought}
                    segments={wheel.segments}
                    showNumbers={false}
                    label={`Abgeschlossenes Fokusrad: ${wheel.targetThought || 'ohne Zielgedanken'}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
                    {wheel.targetThought || 'Ohne Zielgedanken'}
                  </p>
                  <p className="mt-0.5 text-[13px]" style={{ color: 'var(--ink-2)' }}>
                    Stimmung {wheel.startMood}
                    {wheel.endMood !== null ? ` → ${wheel.endMood}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
