import { useState } from 'react'
import { Modal } from './Modal'
import { HABIT_COLORS, HABIT_EMOJIS, DEFAULT_COLOR } from '../lib/colors'
import { IconPlus } from './icons'

export function HabitForm({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: { name: string; emoji: string; color: string }) => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  const [color, setColor] = useState(DEFAULT_COLOR)

  const submit = () => {
    if (!name.trim()) return
    onSubmit({ name, emoji, color })
    setName('')
    setEmoji(HABIT_EMOJIS[0])
    setColor(DEFAULT_COLOR)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Neues Habit</h2>
      </div>

      <label className="block mb-5">
        <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)] mb-2 block">
          Name
        </span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="z. B. Sport treiben"
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-accent)] placeholder:text-[var(--color-ink-faint)]"
        />
      </label>

      <div className="mb-6">
        <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)] mb-2 block">
          Symbol
        </span>
        <div className="flex flex-wrap gap-2">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              aria-label={`Symbol ${e}`}
              className={`h-11 w-11 rounded-lg border text-xl transition-colors ${
                emoji === e
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-line)] bg-[var(--color-surface)]'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-7">
        <span className="text-xs font-medium tracking-wide text-[var(--color-ink-muted)] mb-2 block">
          Farbe
        </span>
        <div className="flex flex-wrap gap-3">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.value)}
              aria-label={`Farbe ${c.label}`}
              aria-pressed={color === c.value}
              className={`h-9 w-9 rounded-full transition-transform ${
                color === c.value ? 'scale-110' : ''
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-ink)] px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#2c2c2b] dark:bg-[var(--color-accent)] dark:text-[#12331f] dark:hover:bg-[#7f9c76] disabled:opacity-40 dark:disabled:hover:bg-[var(--color-accent)]"
      >
        <IconPlus width={19} height={19} />
        Habit anlegen
      </button>
    </Modal>
  )
}
