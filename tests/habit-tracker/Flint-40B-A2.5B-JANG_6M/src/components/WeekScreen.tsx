import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { colorFor, moodMeta } from '../lib/colors'
import { cn } from '../lib/cn'
import { formatDayMonth, lastNDays, todayKey, weekdayShort } from '../lib/date'
import { computeStreaks } from '../lib/streaks'
import { useRhythm } from '../store'
import { EmptyState } from './EmptyState'
import { ChartIcon } from './icons'

interface DayPoint {
  key: string
  label: string
  full: string
  done: number
  mood: number | null
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ dataKey?: string | number; value?: number | string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const done = payload.find((item) => item.dataKey === 'done')?.value
  const mood = payload.find((item) => item.dataKey === 'mood')?.value
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-[var(--shadow-card)]">
      <p className="font-medium text-ink">{label}</p>
      <p className="text-muted">{done ?? 0} erledigt</p>
      {typeof mood === 'number' ? (
        <p className="text-muted">
          Stimmung {mood} · {moodMeta(mood).label}
        </p>
      ) : null}
    </div>
  )
}

export function WeekScreen({ isDark }: { isDark: boolean }) {
  const { habits, isDone, moodFor, datesFor } = useRhythm()
  const date = todayKey()

  const points = useMemo<DayPoint[]>(
    () =>
      lastNDays(7, date).map((key) => ({
        key,
        label: weekdayShort(key),
        full: formatDayMonth(key),
        done: habits.filter((habit) => isDone(habit.id, key)).length,
        mood: moodFor(key)?.mood ?? null,
      })),
    [date, habits, isDone, moodFor],
  )

  const withMood = points.filter((point) => point.mood !== null)
  const moodAvg =
    withMood.length > 0
      ? withMood.reduce((sum, point) => sum + (point.mood ?? 0), 0) / withMood.length
      : null
  const completions = points.reduce((sum, point) => sum + point.done, 0)
  const bestDay = points.reduce<DayPoint | null>(
    (best, point) => (best === null || point.done > best.done ? point : best),
    null,
  )
  const hasData = completions > 0 || withMood.length > 0
  const maxCount = Math.max(1, ...points.map((point) => point.done))

  return (
    <div>
      <header className="animate-rise">
        <p className="text-sm text-muted">Rückblick</p>
        <h1 className="display mt-0.5 text-[2.15rem] text-ink">Woche</h1>
      </header>

      {!hasData ? (
        <div className="mt-6">
          <EmptyState
            icon={<ChartIcon size={24} />}
            title="Noch kein Verlauf"
            description="Sobald du Gewohnheiten abhakst oder deine Stimmung einträgst, erscheint hier dein Verlauf der letzten sieben Tage."
          />
        </div>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-3 gap-2.5" aria-label="Zusammenfassung">
            <div className="card animate-rise p-4">
              <p className="text-xs text-muted">Ø Stimmung</p>
              <p className="tnum mt-1 text-xl font-semibold text-ink">
                {moodAvg === null ? '–' : moodAvg.toFixed(1).replace('.', ',')}
              </p>
              <p className="mt-0.5 text-xs text-faint">
                {moodAvg === null ? 'keine Daten' : moodMeta(Math.round(moodAvg)).emoji}
              </p>
            </div>
            <div className="card animate-rise p-4" style={{ animationDelay: '50ms' }}>
              <p className="text-xs text-muted">Erledigt</p>
              <p className="tnum mt-1 text-xl font-semibold text-ink">{completions}</p>
              <p className="mt-0.5 text-xs text-faint">in 7 Tagen</p>
            </div>
            <div className="card animate-rise p-4" style={{ animationDelay: '100ms' }}>
              <p className="text-xs text-muted">Bester Tag</p>
              <p className="mt-1 text-xl font-semibold text-ink">
                {bestDay && bestDay.done > 0 ? bestDay.label : '–'}
              </p>
              <p className="mt-0.5 text-xs text-faint">
                {bestDay && bestDay.done > 0 ? `${bestDay.done} erledigt` : 'keine Daten'}
              </p>
            </div>
          </section>

          <section className="card animate-rise mt-6 p-4" style={{ animationDelay: '120ms' }}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-ink">Letzte 7 Tage</h2>
              <div className="flex items-center gap-3 text-[0.6875rem] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-accent" />
                  Erledigt
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3.5 rounded-full bg-ink" />
                  Stimmung
                </span>
              </div>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points} margin={{ top: 10, right: 2, bottom: 0, left: 2 }}>
                  <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 6" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                  />
                  <YAxis yAxisId="count" hide domain={[0, maxCount]} />
                  <YAxis
                    yAxisId="mood"
                    orientation="right"
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={18}
                    tick={{ fontSize: 11, fill: 'var(--faint)' }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--elevated)', opacity: 0.5 }} />
                  <Bar
                    yAxisId="count"
                    dataKey="done"
                    fill="var(--accent)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={26}
                  />
                  <Line
                    yAxisId="mood"
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--ink)"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: 'var(--surface)',
                      stroke: 'var(--ink)',
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {habits.length > 0 ? (
            <section className="mt-8" aria-labelledby="streaks-heading">
              <h2
                id="streaks-heading"
                className="text-xs font-medium uppercase tracking-[0.08em] text-muted"
              >
                Serien
              </h2>
              <ul className="card mt-3 divide-y divide-line px-4">
                {habits.map((habit) => {
                  const streak = computeStreaks(datesFor(habit.id), date)
                  const tint = colorFor(habit.color, isDark)
                  return (
                    <li key={habit.id} className="flex items-center gap-3 py-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${tint} 15%, transparent)`,
                        }}
                        aria-hidden="true"
                      >
                        {habit.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{habit.name}</p>
                        <p className="tnum text-xs text-faint">
                          Aktuell {streak.current} · Längste {streak.longest}
                        </p>
                      </div>
                      <div className="flex gap-1" aria-hidden="true">
                        {points.map((point) => {
                          const filled = isDone(habit.id, point.key)
                          return (
                            <span
                              key={point.key}
                              className={cn('h-2 w-2 rounded-full', !filled && 'bg-elevated')}
                              style={filled ? { backgroundColor: tint } : undefined}
                            />
                          )
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}