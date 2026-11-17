import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react'
import { ArrowLeft, Check, Pencil, Trash2 } from 'lucide-react'
import type { FocusWheel } from '../types'
import { SEGMENT_COUNT, WHEEL_DURATION_SECONDS, filledSegmentCount } from '../types'
import { FocusWheelSvg } from '../components/FocusWheelSvg'

interface SessionViewProps {
  draft: FocusWheel
  /** Speichert den Satz für Segment `index` (leerer String löscht das Segment). */
  onSaveSegment: (index: number, text: string) => void
  /** Schließt das Rad ab und fragt danach die End-Stimmung ab. */
  onComplete: () => void
  onBack: () => void
  onDiscard: () => void
}

/** Formatiert Sekunden als „m:ss". */
function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Die aktive Session: SVG-Fokusrad mit dem Zielgedanken im Zentrum,
 * Eingabe für das aktuelle Segment, die acht Sätze darunter (bearbeitbar)
 * und – sobald alle gefüllt sind – der Abschluss-Button.
 */
export function SessionView({
  draft,
  onSaveSegment,
  onComplete,
  onBack,
  onDiscard
}: SessionViewProps): ReactElement {
  const filled = filledSegmentCount(draft)
  const allFilled = filled === SEGMENT_COUNT

  // Nächstes offenes Segment; beim Bearbeiten zeigt die Eingabe den
  // gewählten Satz (editingIndex).
  const nextOpen = useMemo(() => {
    const index = draft.segments.findIndex((segment) => segment.trim().length === 0)
    return index === -1 ? SEGMENT_COUNT - 1 : index
  }, [draft.segments])

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const activeIndex = editingIndex ?? nextOpen
  const [text, setText] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [confirmClear, setConfirmClear] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Eingabefeld spiegelt den bearbeiteten bzw. nächsten offenen Satz.
  useEffect(() => {
    setText(draft.segments[activeIndex] ?? '')
    inputRef.current?.focus()
  }, [activeIndex, draft.segments])

  // Ruhiger 5-Minuten-Rhythmus; nach Ablauf nur eine sanfte Erinnerung.
  const [remaining, setRemaining] = useState(WHEEL_DURATION_SECONDS)
  useEffect(() => {
    const created = new Date(draft.createdAt).getTime()
    const elapsed = Number.isFinite(created)
      ? Math.floor((Date.now() - created) / 1000)
      : 0
    setRemaining(Math.max(0, WHEEL_DURATION_SECONDS - elapsed))
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [draft.createdAt, draft.id])

  const persistText = (value: string): void => {
    setText(value)
    onSaveSegment(activeIndex, value.trim())
  }

  const handleSave = (): void => {
    onSaveSegment(activeIndex, text.trim())
    setEditingIndex(null)
    // Fokussiertes Feld bleibt auf dem nächsten offenen Segment.
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSave()
    }
    if (event.key === 'Escape') {
      setEditingIndex(null)
    }
  }

  const startEditing = (index: number): void => {
    setConfirmClear(null)
    setEditingIndex(index)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Kopfzeile: Zurück, Titel + Fortschritt, Uhr */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Zurück zur Startseite"
          className="press chip flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
            Dein Fokusrad
          </h1>
          <p aria-live="polite" className="text-[13px]" style={{ color: 'var(--ink-2)' }}>
            {filled} von {SEGMENT_COUNT} Gedanken
          </p>
        </div>
        <span
          className="flex h-11 shrink-0 items-center justify-center rounded-full border px-3 text-[15px] font-semibold tabular-nums"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--line)',
            color: remaining === 0 ? 'var(--accent)' : 'var(--ink-2)'
          }}
          aria-label={`Verbleibende Zeit: ${formatClock(remaining)}`}
        >
          {remaining === 0 ? 'gut gemacht' : formatClock(remaining)}
        </span>
      </div>

      {/* Fortschrittsbalken */}
      <div
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={SEGMENT_COUNT}
        aria-label="Fortschritt"
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--bg-soft)' }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${(filled / SEGMENT_COUNT) * 100}%`,
            backgroundColor: 'var(--accent)'
          }}
        />
      </div>

      {/* Das Rad */}
      <div className="flex justify-center pt-2">
        <div className="w-full max-w-75">
          <FocusWheelSvg
            segments={draft.segments}
            targetThought={draft.targetThought}
            className="h-auto w-full"
            label={`Fokusrad, ${filled} von ${SEGMENT_COUNT} Gedanken`}
          />
        </div>
      </div>

      {/* Eingabe für das aktuelle Segment */}
      <div className="card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <label htmlFor="segment-input" className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
            Gedanken {activeIndex + 1} von {SEGMENT_COUNT}
          </label>
          {editingIndex !== null && (
            <span className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
              wird bearbeitet
            </span>
          )}
        </div>
        <textarea
          id="segment-input"
          ref={inputRef}
          rows={2}
          className="field resize-none"
          maxLength={400}
          placeholder="Was könnte dir gerade ein Stück entlasten?"
          value={text}
          onChange={(event) => persistText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={handleSave} className="btn-primary press flex-1">
            <Check size={18} aria-hidden />
            {editingIndex !== null ? 'Änderung speichern' : 'Gedanke festhalten'}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={() => setEditingIndex(null)}
              className="btn-ghost press"
            >
              Abbrechen
            </button>
          )}
        </div>
        <p className="mt-3 text-[13px]" style={{ color: 'var(--ink-3)' }}>
          Eingabe + Enter speichert · die Session wird automatisch zwischengespeichert.
        </p>
      </div>

      {/* Die acht Segmente */}
      <div className="flex flex-col gap-2.5" aria-label="Eingetragene Gedanken">
        {draft.segments.map((segment, index) => {
          const isFilled = segment.trim().length > 0
          return (
            <div
              key={index}
              className="card flex min-h-14 items-center gap-3 p-3.5"
              style={{
                borderColor:
                  index === activeIndex
                    ? 'color-mix(in srgb, var(--accent) 55%, var(--line))'
                    : 'var(--line)'
              }}
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
                style={{
                  backgroundColor: `var(--wheel-${index + 1})`,
                  color: 'var(--seg-num)',
                  opacity: isFilled ? 1 : 0.45
                }}
              >
                {index + 1}
              </span>
              <p
                className="min-w-0 flex-1 text-[15px] leading-snug"
                style={{ color: isFilled ? 'var(--ink)' : 'var(--ink-3)' }}
              >
                {isFilled ? segment : 'Noch ein freies Segment.'}
              </p>
              {isFilled &&
                (confirmClear === index ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmClear(null)
                        setEditingIndex(null)
                        onSaveSegment(index, '')
                      }}
                      className="press flex h-11 items-center gap-1 rounded-full px-3 text-[13px] font-semibold"
                      style={{ backgroundColor: 'var(--danger)', color: '#fdf6f1' }}
                    >
                      <Trash2 size={15} aria-hidden />
                      Löschen
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(null)}
                      className="press h-11 rounded-full px-2 text-[13px]"
                      style={{ color: 'var(--ink-2)' }}
                    >
                      Nein
                    </button>
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => startEditing(index)}
                      aria-label={`Gedanken ${index + 1} bearbeiten`}
                      className="press chip flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ color: 'var(--ink-2)' }}
                    >
                      <Pencil size={16} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(index)}
                      aria-label={`Gedanken ${index + 1} löschen`}
                      className="press chip flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ color: 'var(--ink-3)' }}
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </span>
                ))}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setConfirmDiscard(true)}
        className="press mx-auto text-[13px] underline underline-offset-4"
        style={{ color: 'var(--ink-3)' }}
      >
        Session verwerfen
      </button>

      {confirmDiscard && (
        <div
          role="alertdialog"
          aria-label="Session verwerfen?"
          className="card p-4"
          style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--line))' }}
        >
          <p className="text-[15px] font-semibold" style={{ color: 'var(--ink)' }}>
            Session verwerfen?
          </p>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ink-2)' }}>
            Alle {filled} eingetragenen Gedanken dieser Session gehen verloren.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-ghost press"
              onClick={() => setConfirmDiscard(false)}
            >
              Weitermachen
            </button>
            <button
              type="button"
              className="press flex min-h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold"
              style={{ backgroundColor: 'var(--danger)', color: '#fdf6f1' }}
              onClick={onDiscard}
            >
              <Trash2 size={16} aria-hidden />
              Verwerfen
            </button>
          </div>
        </div>
      )}

      {/* Abschluss (fixiert in der Thumb-Zone) */}
      <div className="action-dock -mx-4 px-4 py-3">
        <div className="card p-4">
          {allFilled ? (
            <>
              <button type="button" onClick={onComplete} className="btn-primary press w-full pop-in">
                <Check size={18} aria-hidden />
                Fokusrad abschließen
              </button>
              <p className="mt-3 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
                Alle acht Gedanken stehen im Rad – fast geschafft.
              </p>
            </>
          ) : (
            <p
              aria-live="polite"
              className="text-center text-[14px] font-medium"
              style={{ color: 'var(--ink-2)' }}
            >
              Noch {SEGMENT_COUNT - filled}{' '}
              {SEGMENT_COUNT - filled === 1 ? 'Gedanke' : 'Gedanken'} bis zum Abschluss.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
