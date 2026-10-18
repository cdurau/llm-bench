import type { Habit } from "../types"
import { IconCheck, IconCheckOutline, IconEdit, IconFlame } from "./icons"

interface HabitRowProps {
  habit: Habit
  completed: boolean
  streak: number
  onToggle: () => void
  onEdit: () => void
  index?: number
}

export default function HabitRow({
  habit,
  completed,
  streak,
  onToggle,
  onEdit,
  index = 0,
}: HabitRowProps) {
  const tint = `rgb(${parseInt(habit.color.slice(1, 3), 16)}, ${parseInt(habit.color.slice(3, 5), 16)}, ${parseInt(habit.color.slice(5, 7), 16)})`

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors duration-200 ${
        completed ? "bg-[var(--surface-alt)]" : ""
      }`}
      style={{
        animationDelay: `${index * 60}ms`,
        animation: "fadeIn 0.4s ease both",
      }}
    >
      <button
        onClick={onToggle}
        aria-label={`${completed ? "Entscheiden" : "Erledigen"}: ${habit.name}`}
        aria-pressed={completed}
        className="flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 active:scale-90"
        style={{
          width: 44,
          height: 44,
          color: completed ? "#ffffff" : tint,
          backgroundColor: completed ? tint : "transparent",
          boxShadow: completed ? `0 2px 8px ${tint}` : "none",
        }}
      >
        {completed ? (
          <IconCheck className="h-5 w-5 animate-pop" />
        ) : (
          <IconCheckOutline className="h-5 w-5" />
        )}
      </button>

      <div
        className="text-xl leading-none"
        aria-hidden="true"
        style={{ filter: completed ? "grayscale(0.6) opacity(0.7)" : "none" }}
      >
        {habit.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={`truncate text-base font-medium tracking-tight transition-opacity duration-200 ${
              completed ? "opacity-60" : "opacity-100"
            }`}
          >
            {habit.name}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: tint, color: "#ffffff" }}>
              <IconFlame className="h-3 w-3" />
              {streak}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onEdit}
        aria-label={`Habit ${habit.name} bearbeiten`}
        className="flex shrink-0 items-center justify-center rounded-xl p-2 text-[var(--text-muted)] opacity-0 transition-all duration-200 hover:bg-[var(--accent-soft)] hover:text-[var(--text)] group-hover:opacity-100"
        style={{ minHeight: 44, minWidth: 44 }}
      >
        <IconEdit className="h-4 w-4" />
      </button>
    </div>
  )
}
