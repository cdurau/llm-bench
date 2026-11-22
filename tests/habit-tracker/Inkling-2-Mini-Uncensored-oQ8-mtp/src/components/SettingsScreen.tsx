import { useState } from 'react'
import { Monitor, Sun, Moon, Plus, Pencil, Trash, Flame, Trophy } from '@phosphor-icons/react'
import type { Habit } from '../types'
import { habitColor, withAlpha } from '../lib/colors'
import { useHabitStats, type RhythmData } from '../hooks/useRhythmData'
import { todayStr } from '../lib/dates'
import type { ThemeMode } from '../hooks/useTheme'

interface Props {
  data: RhythmData
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  onSetMode: (m: ThemeMode) => void
  onAddHabit: () => void
  onEditHabit: (h: Habit) => void
  onDeleteHabit: (id: string) => void
}

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Monitor }[] = [
  { id: 'system', label: 'System', icon: Monitor },
  { id: 'light', label: 'Hell', icon: Sun },
  { id: 'dark', label: 'Dunkel', icon: Moon }
]

export default function SettingsScreen({
  data,
  mode,
  resolvedTheme,
  onSetMode,
  onAddHabit,
  onEditHabit,
  onDeleteHabit
}: Props) {
  const { habits, completions, loading } = data
  const today = todayStr()
  const stats = useHabitStats(habits, completions, today)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  return (
    <div className="px-5 pt-7 pb-6">
      <header className="reveal" style={{ ['--index' as string]: 0 }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6862] dark:text-[#A39E94]">
          Einstellungen
        </p>
        <h1 className="mt-1.5 font-serif text-[34px] leading-[1.08] tracking-[-0.02em] text-[#2F3437] dark:text-[#EDEAE4]">
          Profil & Routinen
        </h1>
      </header>

      {/* Appearance */}
      <section className="mt-6 reveal" style={{ ['--index' as string]: 1 }} aria-label="Erscheinungsbild">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6862] dark:text-[#A39E94] mb-2.5">
          Erscheinungsbild
        </h2>
        <div
          role="radiogroup"
          aria-label="Farbschema"
          className="card p-1.5 flex items-center gap-1"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = mode === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSetMode(opt.id)}
                className={`flex-1 min-h-12 rounded-[10px] flex flex-col items-center justify-center gap-1 transition-all ${
                  active
                    ? 'bg-[#111111] dark:bg-[#EDEAE4] text-white dark:text-[#171614]'
                    : 'text-[#6B6862] dark:text-[#A39E94] hover:bg-[#F1EFEA] dark:hover:bg-[#262522]'
                }`}
              >
                <Icon size={19} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                <span className="text-[11px] font-semibold tracking-tight">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Habits */}
      <section className="mt-7 reveal" style={{ ['--index' as string]: 2 }} aria-label="Gewohnheiten">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6862] dark:text-[#A39E94]">
            Gewohnheiten
          </h2>
          <span className="text-[12px] font-medium tabular-nums text-[#6B6862] dark:text-[#A39E94]">
            {habits.length}
          </span>
        </div>

        {loading ? (
          <div className="card h-24 animate-pulse" aria-hidden="true" />
        ) : habits.length === 0 ? (
          <div className="card px-5 py-8 text-center">
            <p className="text-[14px] text-[#6B6862] dark:text-[#A39E94]">
              Noch keine Gewohnheiten angelegt.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {habits.map((habit) => {
              const stat = stats.get(habit.id)
              const color = habitColor(habit.color, resolvedTheme)
              const confirming = confirmingDelete === habit.id
              return (
                <li key={habit.id} className="card px-3.5 py-3">
                  {confirming ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="flex-1 min-w-[160px] text-[14px] font-semibold text-[#2F3437] dark:text-[#EDEAE4]">
                        „{habit.name}" löschen?
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(null)}
                        className="min-h-11 px-4 rounded-md text-[13px] font-semibold text-[#6B6862] dark:text-[#A39E94] hover:text-[#2F3437] dark:hover:text-[#EDEAE4] transition-colors"
                      >
                        Behalten
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteHabit(habit.id)
                          setConfirmingDelete(null)
                        }}
                        className="min-h-11 px-4 rounded-md bg-[#A8431F] text-white text-[13px] font-semibold tracking-tight transition-all hover:bg-[#8F3A1C] active:scale-[0.98]"
                      >
                        Löschen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-10 h-10 rounded-[10px] inline-flex items-center justify-center text-[20px] leading-none"
                        style={{ backgroundColor: withAlpha(color, resolvedTheme === 'dark' ? 0.16 : 0.11) }}
                      >
                        {habit.emoji}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate text-[15px] font-semibold tracking-tight text-[#2F3437] dark:text-[#EDEAE4]">
                          {habit.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-3 text-[11px] font-medium text-[#6B6862] dark:text-[#A39E94]">
                          <span className="inline-flex items-center gap-1">
                            <Flame size={11} weight="bold" aria-hidden="true" />
                            {stat?.current ?? 0} aktuell
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Trophy size={11} weight="bold" aria-hidden="true" />
                            {stat?.longest ?? 0} best
                          </span>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onEditHabit(habit)}
                        aria-label={`${habit.name} bearbeiten`}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-md text-[#6B6862] dark:text-[#A39E94] hover:text-[#2F3437] dark:hover:text-[#EDEAE4] hover:bg-[#F1EFEA] dark:hover:bg-[#262522] transition-colors"
                      >
                        <Pencil size={18} weight="bold" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(habit.id)}
                        aria-label={`${habit.name} löschen`}
                        className="w-11 h-11 inline-flex items-center justify-center rounded-md text-[#6B6862] dark:text-[#A39E94] hover:text-[#A8431F] dark:hover:text-[#E8A87C] hover:bg-[#F1EFEA] dark:hover:bg-[#262522] transition-colors"
                      >
                        <Trash size={18} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={onAddHabit}
          className="mt-3 w-full min-h-12 card inline-flex items-center justify-center gap-2 text-[15px] font-semibold tracking-tight text-[#2F3437] dark:text-[#EDEAE4] hover:shadow-[0_1px_2px_rgba(23,22,20,0.04),0_14px_34px_rgba(23,22,20,0.06)] transition-all active:scale-[0.99]"
        >
          <Plus size={18} weight="bold" aria-hidden="true" />
          Neue Gewohnheit
        </button>
      </section>

      <footer className="mt-8 text-center reveal" style={{ ['--index' as string]: 3 }}>
        <p className="text-[11px] leading-relaxed text-[#6B6862] dark:text-[#A39E94]">
          Rhythm · alle Daten bleiben auf diesem Gerät
          <br />
          IndexedDB · kein Konto, keine Cloud
        </p>
      </footer>
    </div>
  )
}
