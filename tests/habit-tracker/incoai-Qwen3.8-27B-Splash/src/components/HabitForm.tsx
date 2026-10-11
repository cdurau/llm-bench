import { useEffect, useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { Habit } from '../lib/db'
import { HABIT_COLORS, HABIT_EMOJIS, habitAccent } from '../lib/palette'
import { useRhythm } from '../store'
import { useTheme } from '../lib/theme'

interface HabitFormProps {
  /** null = neues Habit anlegen */
  habit: Habit | null
  onClose: () => void
}

/** Bottom-Sheet zum Anlegen und Bearbeiten von Gewohnheiten. */
export function HabitForm({ habit, onClose }: HabitFormProps) {
  const { mode } = useTheme()
  const { addHabit, updateHabit, deleteHabit } = useRhythm()

  const [name, setName] = useState(habit?.name ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? HABIT_EMOJIS[0])
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0].id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const firstSwatchRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function save() {
    const trimmed = name.trim()
    if (!trimmed || busy) return
    setBusy(true)
    if (habit) {
      await updateHabit(habit.id, { name: trimmed, emoji, color })
    } else {
      await addHabit({ name: trimmed, emoji, color })
    }
    onClose()
  }

  async function remove() {
    if (!habit || busy) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setBusy(true)
    await deleteHabit(habit.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Schließen"
        onClick={onClose}
        className="fade-in absolute inset-0 h-full w-full cursor-default bg-ink/25 backdrop-blur-[2px]"
        style={{ backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.55)' : undefined }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={habit ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
        className="sheet-up absolute inset-x-0 bottom-0 mx-auto max-w-md"
      >
        <div
          className="rounded-t-card border border-b-0 border-line bg-surface shadow-soft"
          style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto mb-4 mt-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />

          <div className="flex items-center justify-between px-5">
            <h2 className="font-serif text-[22px] font-semibold tracking-[-0.02em] text-ink">
              {habit ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink"
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          <div className="mt-5 space-y-6 px-5">
            <div>
              <label htmlFor="habit-name" className="text-xs font-medium tracking-[0.05em] text-muted uppercase">
                Name
              </label>
              <input
                id="habit-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void save()
                }}
                placeholder="z. B. Morgens 500 ml Wasser trinken"
                autoComplete="off"
                className="mt-2 h-11 w-full rounded-[10px] border border-line bg-canvas px-3.5 text-[15px] text-ink outline-none placeholder:text-faint focus-visible:border-ink/50"
              />
            </div>

            <div>
              <span className="text-xs font-medium tracking-[0.05em] text-muted uppercase">Symbol</span>
              <div className="mt-2 grid grid-cols-6 gap-2" role="group" aria-label="Symbol wählen">
                {HABIT_EMOJIS.map((e) => {
                  const selected = e === emoji
                  return (
                    <button
                      key={e}
                      type="button"
                      ref={selected ? firstSwatchRef : undefined}
                      aria-pressed={selected}
                      aria-label={`Symbol ${e}`}
                      onClick={() => setEmoji(e)}
                      className={
                        'grid h-11 place-items-center rounded-[10px] border text-[20px] transition-transform active:scale-95 ' +
                        (selected ? 'border-ink bg-canvas' : 'border-line hover:border-line-strong')
                      }
                    >
                      {e}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium tracking-[0.05em] text-muted uppercase">Farbe</span>
              <div className="mt-2.5 flex gap-3" role="group" aria-label="Farbe wählen">
                {HABIT_COLORS.map((c) => {
                  const selected = c.id === color
                  const accent = habitAccent(c.id, mode)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      aria-pressed={selected}
                      aria-label={`Farbe ${c.name}`}
                      onClick={() => setColor(c.id)}
                      className={
                        'h-9 w-9 rounded-full transition-transform active:scale-95 ' +
                        (selected
                          ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface'
                          : 'ring-1 ring-line')
                      }
                      style={{ backgroundColor: accent }}
                    />
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-faint">{HABIT_COLORS.find((c) => c.id === color)?.name}</p>
            </div>

            <div className="flex gap-3 pt-1">
              {habit ? (
                <button
                  type="button"
                  onClick={() => void remove()}
                  className="min-h-11 rounded-[6px] px-4 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                >
                  {confirmDelete ? 'Wirklich löschen?' : 'Löschen'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void save()}
                disabled={!name.trim() || busy}
                className="min-h-11 flex-1 rounded-[6px] bg-ink font-medium text-canvas transition-[transform,opacity] active:scale-[0.98] disabled:opacity-40"
              >
                {habit ? 'Speichern' : 'Hinzufügen'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-[6px] border border-line px-4 text-sm font-medium text-muted"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
