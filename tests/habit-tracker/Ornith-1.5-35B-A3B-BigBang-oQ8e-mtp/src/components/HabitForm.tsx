import { useEffect, useRef, useState } from "react"
import type { Habit } from "../types"
import { PALETTE, HABIT_EMOJIS } from "../lib/colors"
import { IconPlus } from "./icons"

interface HabitFormProps {
  habit?: Habit | null
  onSave: (patch: { name: string; emoji: string; color: string }) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export default function HabitForm({ habit, onSave, onDelete, onClose }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? "")
  const [emoji, setEmoji] = useState(habit?.emoji ?? HABIT_EMOJIS[0])
  const [color, setColor] = useState(habit?.color ?? PALETTE[0].value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ name: trimmed, emoji, color })
  }

  const title = habit ? "Habit anpassen" : "Neuer Habit"

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-2xl bg-[var(--surface)] p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-lg px-2 py-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            ✕
          </button>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit()
            }}
            placeholder="z. B. Meditieren"
            maxLength={40}
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Symbol
          </label>
          <div className="grid grid-cols-8 gap-2">
            {HABIT_EMOJIS.map((e) => (
              <button
                key={e}
                aria-label={`Symbol ${e}`}
                onClick={() => setEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-colors ${
                  emoji === e
                    ? "bg-[var(--accent-soft)] text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                }`}
                style={{ minHeight: 44 }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Farbe
          </label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c.value}
                aria-label={`Farbe ${c.name}`}
                title={c.name}
                onClick={() => setColor(c.value)}
                className="rounded-full transition-transform hover:scale-110"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: c.value,
                  boxShadow:
                    color === c.value
                      ? `0 0 0 3px var(--surface), 0 0 0 5px ${c.value}`
                      : "none",
                  minHeight: 32,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {habit && onDelete && (
            <button
              onClick={() => onDelete(habit.id)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)] hover:text-[var(--danger-text)]"
              style={{ minWidth: 44 }}
            >
              Löschen
            </button>
          )}
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_85%,black)] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ minHeight: 44 }}
          >
            <IconPlus className="h-4 w-4" />
            {habit ? "Speichern" : "Anlegen"}
          </button>
        </div>
      </div>
    </div>
  )
}
