import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { HABIT_COLORS } from '../lib/colors'

const EMOJIS = ['💧', '📖', '🏃', '🧘', '🎵', '🍎', '☀️', '💪', '🌱', '✍️']

export default function AddHabitForm({ onClose }: { onClose: () => void }) {
  const { addHabit } = useStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [colorId, setColorId] = useState(HABIT_COLORS[0].id)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const save = async () => {
    const n = name.trim()
    if (!n) return
    await addHabit({ name: n, emoji, colorId })
    onClose()
  }

  return (
    <div className="card reveal mt-6 p-5">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Name
      </label>
      <input
        data-testid="habit-name"
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') onClose()
        }}
        placeholder="z. B. Wasser trinken"
        className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-base text-[var(--text)] focus-visible"
        aria-label="Habit-Name"
      />

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Emoji
        </span>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-pressed={emoji === e}
              className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xl transition-colors ${
                emoji === e
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
              aria-label={`Emoji ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Farbe
        </span>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColorId(c.id)}
              aria-pressed={colorId === c.id}
              className={`relative flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
                colorId === c.id ? 'border-[var(--accent)]' : 'border-[var(--border)]'
              }`}
              style={{ background: c.soft }}
              aria-label={`Farbe ${c.label}`}
            >
              <span
                className="h-5 w-5 rounded-full"
                style={{ background: c.light }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible"
        >
          Abbrechen
        </button>
        <button
          data-testid="habit-save"
          type="button"
          onClick={save}
          disabled={!name.trim()}
          className="rounded-md bg-[var(--accent-strong)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition-transform active:scale-95 disabled:opacity-40 focus-visible"
        >
          Speichern
        </button>
      </div>
    </div>
  )
}