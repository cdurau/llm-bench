import { useState } from 'react'
import { DEFAULT_COLOR, HABIT_COLORS, HABIT_EMOJIS } from '../lib/colors'
import { cn } from '../lib/cn'
import { useRhythm } from '../store'
import type { Habit } from '../types'
import { Button } from './Button'
import { Modal } from './Modal'
import { TrashIcon } from './icons'

interface HabitFormProps {
  open: boolean
  onClose: () => void
  habit?: Habit | null
}

export function HabitForm({ open, onClose, habit = null }: HabitFormProps) {
  const { addHabit, updateHabit, removeHabit } = useRhythm()
  const [name, setName] = useState(habit?.name ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? HABIT_EMOJIS[0])
  const [color, setColor] = useState(habit?.color ?? DEFAULT_COLOR)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isEditing = Boolean(habit)
  const canSave = name.trim().length > 0

  function handleSave() {
    if (!canSave) return
    const trimmed = name.trim()
    const payload = { name: trimmed, emoji, color }
    onClose()
    if (habit) {
      void updateHabit(habit.id, payload)
    } else {
      void addHabit(payload)
    }
  }

  function handleDelete() {
    if (!habit) return
    onClose()
    void removeHabit(habit.id)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
      subtitle={
        isEditing ? 'Name, Symbol und Farbe anpassen.' : 'Was möchtest du regelmäßig tun?'
      }
    >
      <div className="card flex items-center gap-4 bg-elevated px-4 py-3.5">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
          aria-hidden="true"
        >
          {emoji}
        </span>
        <span
          className={cn(
            'truncate text-[0.975rem] font-medium',
            name.trim() ? 'text-ink' : 'text-faint',
          )}
        >
          {name.trim() || 'Vorschau'}
        </span>
      </div>

      <div className="mt-6">
        <label
          htmlFor="habit-name"
          className="text-xs font-medium uppercase tracking-[0.08em] text-muted"
        >
          Name
        </label>
        <input
          id="habit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSave()
          }}
          maxLength={40}
          placeholder="z. B. Zehn Minuten lesen"
          autoComplete="off"
          className="mt-2 min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-[0.975rem] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Symbol
        </legend>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {HABIT_EMOJIS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setEmoji(item)}
              aria-label={`Symbol ${item}`}
              aria-pressed={emoji === item}
              className={cn(
                'press grid min-h-11 w-full place-items-center rounded-xl border text-xl',
                emoji === item
                  ? 'border-accent bg-accent-soft'
                  : 'border-transparent hover:bg-elevated',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Farbe
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {HABIT_COLORS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setColor(item.value)}
              aria-label={`Farbe ${item.label}`}
              aria-pressed={color === item.value}
              className={cn(
                'press h-11 w-11 rounded-full ring-offset-2 ring-offset-surface',
                color === item.value ? 'ring-2 ring-ink' : 'ring-1 ring-line',
              )}
              style={{ backgroundColor: item.value }}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex items-center gap-3">
        {isEditing ? (
          confirmDelete ? (
            <>
              <Button variant="quiet" onClick={() => setConfirmDelete(false)}>
                Abbrechen
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => void handleDelete()}>
                Endgültig löschen
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              aria-label="Gewohnheit löschen"
              className="px-3.5"
            >
              <TrashIcon size={18} />
            </Button>
          )
        ) : null}
        <Button
          variant="primary"
          className="flex-1"
          disabled={!canSave}
          onClick={handleSave}
        >
          {isEditing ? 'Speichern' : 'Hinzufügen'}
        </Button>
      </div>
    </Modal>
  )
}