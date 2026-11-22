import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import type { Habit, HabitColorKey } from '../types'
import { HABIT_COLORS, habitColor } from '../lib/colors'
import { HABIT_EMOJIS } from '../types'

interface Props {
  open: boolean
  initial?: Habit | null
  resolvedTheme: 'light' | 'dark'
  onClose: () => void
  onSave: (data: { name: string; emoji: string; color: HabitColorKey }) => void
}

const MAX_NAME = 28

export default function HabitSheet({ open, initial, resolvedTheme, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  const [color, setColor] = useState<HabitColorKey>('clay')

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setEmoji(initial?.emoji ?? HABIT_EMOJIS[0])
      setColor(initial?.color ?? 'clay')
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const trimmed = name.trim()
  const valid = trimmed.length > 0

  const submit = () => {
    if (!valid) return
    onSave({ name: trimmed, emoji, color })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      <button
        type="button"
        aria-label="Schließen"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 dark:bg-black/60 fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
        className="sheet-up relative w-full sm:max-w-[400px] bg-[#FFFFFF] dark:bg-[#1E1D1B] border border-[#8E8A84] dark:border-[#78736C] rounded-t-2xl sm:rounded-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)] max-h-[88dvh] overflow-y-auto nice-scroll"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="font-serif text-[22px] tracking-tight text-[#2F3437] dark:text-[#EDEAE4]">
            {initial ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="w-11 h-11 -mr-2 inline-flex items-center justify-center rounded-md text-[#6B6862] dark:text-[#A39E94] hover:text-[#2F3437] dark:hover:text-[#EDEAE4] transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <form
          className="px-5 pb-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label htmlFor="habit-name" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6862] dark:text-[#A39E94] mb-1.5">
            Name
          </label>
          <input
            id="habit-name"
            type="text"
            value={name}
            maxLength={MAX_NAME}
            autoFocus
            placeholder="z. B. Laufen"
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-12 px-3.5 rounded-lg border border-[#8E8A84] dark:border-[#78736C] bg-[#F9F9F8] dark:bg-[#262522] text-[#2F3437] dark:text-[#EDEAE4] text-[16px] placeholder:text-[#6B6862] dark:placeholder:text-[#A39E94] focus:outline-none focus:border-[#A8431F] dark:focus:border-[#E8A87C] focus:ring-2 focus:ring-[#A8431F]/20 dark:focus:ring-[#E8A87C]/20 transition-colors"
          />

          <fieldset className="mt-5">
            <legend className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6862] dark:text-[#A39E94] mb-2">
              Symbol
            </legend>
            <div className="grid grid-cols-6 gap-1.5">
              {HABIT_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  aria-pressed={emoji === em}
                  aria-label={`Symbol ${em}`}
                  className={`h-11 rounded-lg text-[22px] leading-none transition-all border ${
                    emoji === em
                      ? 'border-[#A8431F] dark:border-[#E8A87C] bg-[#FDF0E9] dark:bg-[rgba(232,168,124,0.14)] scale-[1.04]'
                      : 'border-transparent hover:bg-[#F1EFEA] dark:hover:bg-[#2A2926]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6862] dark:text-[#A39E94] mb-2">
              Farbe
            </legend>
            <div className="flex items-center gap-2.5 flex-wrap">
              {HABIT_COLORS.map((c) => {
                const active = color === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColor(c.key)}
                    aria-pressed={active}
                    aria-label={`Farbe ${c.label}`}
                    title={c.label}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-full transition-transform active:scale-95"
                  >
                    <span
                      aria-hidden="true"
                      className={`block w-7 h-7 rounded-full transition-all ${
                        active ? 'ring-2 ring-offset-2 ring-offset-[#FFFFFF] dark:ring-offset-[#1E1D1B] ring-[#2F3437] dark:ring-[#EDEAE4] scale-110' : ''
                      }`}
                      style={{ backgroundColor: habitColor(c.key, resolvedTheme) }}
                    />
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex items-center gap-3 mt-7">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md text-[15px] font-semibold text-[#6B6862] dark:text-[#A39E94] hover:text-[#2F3437] dark:hover:text-[#EDEAE4] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!valid}
              className="flex-1 min-h-11 px-4 rounded-md bg-[#111111] dark:bg-[#EDEAE4] text-white dark:text-[#171614] text-[15px] font-semibold tracking-tight transition-all hover:bg-[#2A2A2A] dark:hover:bg-[#F4F2EE] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            >
              {initial ? 'Änderungen speichern' : 'Gewohnheit anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
