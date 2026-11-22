import { Flame, Trophy, Plus } from '@phosphor-icons/react'
import { formatLong, todayStr } from '../lib/dates'
import { habitColor, withAlpha } from '../lib/colors'
import type { RhythmData } from '../hooks/useRhythmData'
import { useHabitStats } from '../hooks/useRhythmData'
import MoodCard from './MoodCard'
import EmptyState from './EmptyState'
import { Check } from '@phosphor-icons/react'

interface Props {
  data: RhythmData
  resolvedTheme: 'light' | 'dark'
  onToggleHabit: (id: string) => void
  onAddHabit: () => void
  onSelectMood: (value: 1 | 2 | 3 | 4 | 5) => void
  onSaveNote: (note: string) => void
  onClearMood: () => void
}

export default function TodayScreen({
  data,
  resolvedTheme,
  onToggleHabit,
  onAddHabit,
  onSelectMood,
  onSaveNote,
  onClearMood
}: Props) {
  const today = todayStr()
  const { habits, completions, moods, loading } = data
  const stats = useHabitStats(habits, completions, today)

  const total = habits.length
  const done = habits.filter((h) => stats.get(h.id)?.doneToday).length
  const progress = total > 0 ? done / total : 0

  return (
    <div className="px-5 pt-7 pb-6">
      {/* Header */}
      <header className="reveal" style={{ ['--index' as string]: 0 }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6862] dark:text-[#A39E94]">
          Heute
        </p>
        <h1 className="mt-1.5 font-serif text-[34px] leading-[1.08] tracking-[-0.02em] text-[#2F3437] dark:text-[#EDEAE4]">
          {formatLong(today)}
        </h1>

        {total > 0 && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-[14px] font-semibold tracking-tight text-[#2F3437] dark:text-[#EDEAE4]">
              {done} von {total} erledigt
            </p>
            <span className="text-[13px] font-medium tabular-nums text-[#6B6862] dark:text-[#A39E94]">
              {Math.round(progress * 100)} %
            </span>
          </div>
        )}
        {total > 0 && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label="Fortschritt heute"
            className="mt-2 h-1.5 rounded-full bg-[#EAEAEA] dark:bg-[#2A2926] overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: resolvedTheme === 'dark' ? '#E8A87C' : '#A8431F'
              }}
            />
          </div>
        )}
      </header>

      {/* Habits */}
      <section aria-label="Gewohnheiten" className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-[76px] animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState
            icon={<Plus size={24} weight="bold" aria-hidden="true" />}
            title="Noch keine Gewohnheiten"
            body="Lege deine erste Gewohnheit an — zum Beispiel „Laufen“, „Lesen“ oder „Trinken“ — und baue daraus eine kleine tägliche Routine."
            action={{ label: 'Gewohnheit anlegen', onClick: onAddHabit }}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {habits.map((habit, i) => {
              const stat = stats.get(habit.id)!
              const color = habitColor(habit.color, resolvedTheme)
              const doneToday = stat.doneToday
              return (
                <li
                  key={habit.id}
                  className="reveal"
                  style={{ ['--index' as string]: i + 1 }}
                >
                  <button
                    type="button"
                    onClick={() => onToggleHabit(habit.id)}
                    aria-pressed={doneToday}
                    aria-label={`${habit.name}${doneToday ? ' erledigt' : ''} — Streak ${stat.current}`}
                    className="group w-full text-left card flex items-center gap-3.5 px-4 py-3.5 min-h-[76px] transition-all duration-200 active:scale-[0.985] hover:shadow-[0_1px_2px_rgba(23,22,20,0.04),0_14px_34px_rgba(23,22,20,0.06)]"
                    style={{
                      backgroundColor: doneToday
                        ? withAlpha(color, resolvedTheme === 'dark' ? 0.13 : 0.07)
                        : undefined
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={`shrink-0 w-8 h-8 rounded-full border-2 inline-flex items-center justify-center transition-all duration-200 ${
                        doneToday ? 'check-pop border-transparent' : 'border-[#8E8A84] dark:border-[#78736C] group-hover:border-[#6B6862] dark:group-hover:border-[#78736C]'
                      }`}
                      style={doneToday ? { backgroundColor: color } : undefined}
                    >
                      {doneToday && (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke={resolvedTheme === 'dark' ? '#171614' : '#FFFFFF'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="draw-check"
                          />
                        </svg>
                      )}
                    </span>

                    <span
                      aria-hidden="true"
                      className="shrink-0 w-11 h-11 rounded-[10px] inline-flex items-center justify-center text-[24px] leading-none"
                      style={{
                        backgroundColor: withAlpha(color, resolvedTheme === 'dark' ? 0.16 : 0.11)
                      }}
                    >
                      {habit.emoji}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-[16px] font-semibold tracking-tight text-[#2F3437] dark:text-[#EDEAE4]">
                        {habit.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-3 text-[12px] font-medium text-[#6B6862] dark:text-[#A39E94]">
                        <span className="inline-flex items-center gap-1">
                          <Flame size={12} weight="bold" aria-hidden="true" style={{ color: stat.current > 0 ? color : undefined }} />
                          {stat.current}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Trophy size={12} weight="bold" aria-hidden="true" />
                          {stat.longest}
                        </span>
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      {doneToday ? (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] px-2.5 py-1 rounded-full"
                          style={{
                            color,
                            backgroundColor: withAlpha(color, resolvedTheme === 'dark' ? 0.16 : 0.1)
                          }}
                        >
                          <Check size={12} weight="bold" aria-hidden="true" />
                          Erledigt
                        </span>
                      ) : (
                        <span className="text-[12px] font-medium text-[#6B6862] dark:text-[#A39E94]">
                          offen
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Mood */}
      <div className="mt-6 reveal" style={{ ['--index' as string]: 4 }}>
        <MoodCard
          mood={moods.get(today)}
          resolvedTheme={resolvedTheme}
          onSelect={onSelectMood}
          onSaveNote={onSaveNote}
          onClear={onClearMood}
        />
      </div>
    </div>
  )
}
