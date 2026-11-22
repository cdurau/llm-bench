import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { CalendarBlank } from '@phosphor-icons/react'
import { lastNDays, todayStr, weekdayShort, dayMonthShort } from '../lib/dates'
import { moodDef } from '../lib/mood'
import type { RhythmData } from '../hooks/useRhythmData'
import EmptyState from './EmptyState'

interface Props {
  data: RhythmData
  resolvedTheme: 'light' | 'dark'
  onAddHabit: () => void
}

interface ChartDay {
  date: string
  label: string
  done: number
  total: number
  mood: number | null
  moodLabel: string
}

const ACCENT_LIGHT = '#A8431F'
const ACCENT_DARK = '#E8A87C'
const MOOD_LIGHT = '#B57718'
const MOOD_DARK = '#D8B65C'

export default function WeekScreen({ data, resolvedTheme, onAddHabit }: Props) {
  const { habits, completions, moods, loading } = data
  const today = todayStr()

  const accent = resolvedTheme === 'dark' ? ACCENT_DARK : ACCENT_LIGHT
  const moodColor = resolvedTheme === 'dark' ? MOOD_DARK : MOOD_LIGHT
  const gridColor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.07)' : '#EAEAEA'
  const textColor = resolvedTheme === 'dark' ? '#A39E94' : '#6B6862'

  const days = useMemo<ChartDay[]>(() => {
    const dates = lastNDays(7, today)
    const doneByDate = new Map<string, number>()
    for (const c of completions) {
      if (dates.includes(c.date)) {
        doneByDate.set(c.date, (doneByDate.get(c.date) ?? 0) + 1)
      }
    }
    return dates.map((date) => {
      const entry = moods.get(date)
      const def = entry ? moodDef(entry.mood) : undefined
      return {
        date,
        label: weekdayShort(date),
        done: doneByDate.get(date) ?? 0,
        total: habits.length,
        mood: entry ? entry.mood : null,
        moodLabel: def?.label ?? ''
      }
    })
  }, [completions, moods, habits, today])

  const totalDays = days.length
  const totalHabits = habits.length
  const hasData = days.some((d) => d.done > 0 || d.mood != null)

  const moodValues = days.filter((d) => d.mood != null).map((d) => d.mood as number)
  const avgMood = moodValues.length
    ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
    : null

  const progresses = days
    .filter((d) => d.total > 0)
    .map((d) => d.done / d.total)
  const avgProgress = progresses.length
    ? progresses.reduce((a, b) => a + b, 0) / progresses.length
    : null

  return (
    <div className="px-5 pt-7 pb-6">
      <header className="reveal" style={{ ['--index' as string]: 0 }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6862] dark:text-[#A39E94]">
          Woche
        </p>
        <h1 className="mt-1.5 font-serif text-[34px] leading-[1.08] tracking-[-0.02em] text-[#2F3437] dark:text-[#EDEAE4]">
          Letzte 7 Tage
        </h1>
      </header>

      {!loading && !hasData && (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarBlank size={24} weight="bold" aria-hidden="true" />}
            title="Noch keine Daten"
            body={totalHabits === 0
              ? 'Lege deine Gewohnheiten an und haken sie ab — hier wachsen mit der Zeit Fortschritt und Stimmungsverlauf.'
              : 'Heute ist der Startschuss. Habe die Woche deine Gewohnheiten ab und zeichne deine Stimmung — dann zeigt diese Ansicht den Verlauf.'}
            action={totalHabits === 0 ? { label: 'Gewohnheit anlegen', onClick: onAddHabit } : undefined}
          />
        </div>
      )}

      {hasData && (
        <>
          {/* Summary chips */}
          <div className="mt-5 grid grid-cols-2 gap-3 reveal" style={{ ['--index' as string]: 1 }}>
            <div className="card px-4 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6862] dark:text-[#A39E94]">
                Ø Stimmung
              </p>
              <p className="mt-1 font-serif text-[24px] leading-none tracking-tight text-[#2F3437] dark:text-[#EDEAE4] tabular-nums">
                {avgMood != null ? avgMood.toFixed(1) : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[#6B6862] dark:text-[#A39E94]">
                {moodValues.length > 0 ? `${moodValues.length} von ${totalDays} Tagen` : 'keine Werte'}
              </p>
            </div>
            <div className="card px-4 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6862] dark:text-[#A39E94]">
                Ø Fortschritt
              </p>
              <p className="mt-1 font-serif text-[24px] leading-none tracking-tight text-[#2F3437] dark:text-[#EDEAE4] tabular-nums">
                {avgProgress != null ? `${Math.round(avgProgress * 100)} %` : '—'}
              </p>
              <p className="mt-1 text-[11px] text-[#6B6862] dark:text-[#A39E94]">
                {totalHabits > 0 ? `${totalHabits} Gewohnheiten` : 'keine Gewohnheiten'}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4 card p-4 reveal" style={{ ['--index' as string]: 2 }}>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6862] dark:text-[#A39E94]">
              Fortschritt & Stimmung
            </p>
            <div className="mt-3 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={days} margin={{ top: 8, right: 0, bottom: 0, left: -22 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    yAxisId="habits"
                    domain={[0, Math.max(1, totalHabits)]}
                    tick={{ fill: textColor, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={totalHabits > 0 ? Array.from({ length: totalHabits + 1 }, (_, i) => i) : [0, 1]}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="mood"
                    orientation="right"
                    domain={[1, 5]}
                    tick={{ fill: textColor, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[1, 2, 3, 4, 5]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null
                      const d = payload[0]?.payload as ChartDay
                      return (
                        <div className="rounded-lg border border-[#8E8A84] dark:border-[#78736C] bg-[#FFFFFF] dark:bg-[#262522] px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6862] dark:text-[#A39E94]">
                            {dayMonthShort(d.date)}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold text-[#2F3437] dark:text-[#EDEAE4]">
                            {d.total > 0 ? `${d.done} von ${d.total} erledigt` : 'keine Gewohnheiten'}
                          </p>
                          {d.mood != null ? (
                            <p className="text-[13px] text-[#6B6862] dark:text-[#A39E94]">
                              Stimmung {d.mood} — {d.moodLabel}
                            </p>
                          ) : (
                            <p className="text-[13px] text-[#6B6862] dark:text-[#A39E94]">keine Stimmung</p>
                          )}
                        </div>
                      )
                    }}
                  />
                  <Bar
                    yAxisId="habits"
                    dataKey="done"
                    fill={accent}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={26}
                  />
                  <Line
                    yAxisId="mood"
                    type="monotone"
                    dataKey="mood"
                    stroke={moodColor}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: moodColor, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: moodColor, strokeWidth: 2, stroke: resolvedTheme === 'dark' ? '#171614' : '#FFFFFF' }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B6862] dark:text-[#A39E94]">
                <span aria-hidden="true" className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: accent }} />
                Erledigt
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B6862] dark:text-[#A39E94]">
                <span aria-hidden="true" className="w-3 h-[3px] rounded-full" style={{ backgroundColor: moodColor }} />
                Stimmung
              </span>
            </div>
          </div>

          {/* Day list */}
          <ul className="mt-4 flex flex-col gap-2 reveal" style={{ ['--index' as string]: 3 }}>
            {[...days].reverse().map((d) => (
              <li key={d.date} className="card px-4 py-3 flex items-center gap-3">
                <span className="w-14 text-[13px] font-semibold text-[#2F3437] dark:text-[#EDEAE4] tabular-nums">
                  {weekdayShort(d.date)}
                </span>
                <span className="text-[11px] text-[#6B6862] dark:text-[#A39E94] tabular-nums w-10">
                  {dayMonthShort(d.date)}
                </span>
                <span className="flex-1 h-1.5 rounded-full bg-[#EAEAEA] dark:bg-[#2A2926] overflow-hidden">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: d.total > 0 ? `${(d.done / d.total) * 100}%` : '0%',
                      backgroundColor: accent
                    }}
                  />
                </span>
                <span className="text-[12px] font-medium tabular-nums text-[#6B6862] dark:text-[#A39E94] w-9 text-right">
                  {d.done}/{d.total}
                </span>
                <span className="w-8 text-center text-[20px] leading-none" aria-hidden="true">
                  {d.mood != null ? moodDef(d.mood)?.emoji : '—'}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
