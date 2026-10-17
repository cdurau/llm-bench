import { useMemo, type CSSProperties } from 'react'
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
import { EmptyState } from '../components/EmptyState'
import { IconWeek } from '../components/Icon'
import {
  dayKey,
  formatRange,
  formatShortDay,
  lastNDays,
  parseDayKey,
  todayKey,
  formatLong,
} from '../lib/dates'
import { moodByValue } from '../lib/palette'
import { useApp } from '../state/AppProvider'

interface WeekPoint {
  key: string
  label: string
  done: number
  total: number
  mood: number | null
  note: string
  isToday: boolean
}

function WeekTooltip(props: { active?: boolean; payload?: Array<{ payload: WeekPoint }> }) {
  const { active, payload } = props
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  const mood = point.mood !== null ? moodByValue(point.mood) : undefined
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{formatLong(parseDayKey(point.key))}</p>
      <p className="mt-1 text-ink-soft">
        {point.done} von {point.total} Habits
      </p>
      <p className="text-ink-soft">
        {mood ? `Stimmung: ${mood.label}` : 'Keine Stimmung erfasst'}
      </p>
      {point.note && <p className="mt-1 max-w-[180px] text-ink-faint">„{point.note}“</p>}
    </div>
  )
}

/** Woche-Screen: Chart der letzten 7 Tage (Haken + Stimmung) plus Kennzahlen. */
export function WeekScreen() {
  const app = useApp()
  const habitIds = useMemo(() => new Set(app.habits.map((habit) => habit.id)), [app.habits])

  const days = useMemo(() => lastNDays(7), [])

  const data = useMemo<WeekPoint[]>(() => {
    const today = todayKey()
    return days.map((day) => {
      const key = dayKey(day)
      const done = app.completions.filter(
        (c) => c.date === key && habitIds.has(c.habitId),
      ).length
      const mood = app.moods.find((m) => m.date === key)
      return {
        key,
        label: formatShortDay(day),
        done,
        total: app.habits.length,
        mood: mood ? mood.value : null,
        note: mood?.note ?? '',
        isToday: key === today,
      }
    })
  }, [app.completions, app.moods, app.habits, habitIds, days])

  const hasData = data.some((point) => point.done > 0 || point.mood !== null)
  const moodValues = data.filter((point) => point.mood !== null).map((point) => point.mood as number)
  const avgMood = moodValues.length
    ? moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length
    : null
  const totalDone = data.reduce((sum, point) => sum + point.done, 0)
  const maxDone = Math.max(3, ...data.map((point) => point.done))

  return (
    <div>
      <p className="text-sm text-ink-faint">{formatRange(days[0], days[6])}</p>
      <h1 className="mt-1 font-serif text-[34px] leading-[1.08] tracking-[-0.02em]">Woche</h1>

      {hasData ? (
        <section
          className="reveal mt-6 rounded-2xl border border-line bg-surface p-5"
          style={{ '--i': 0 } as CSSProperties}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
              Letzte 7 Tage
            </h2>
            <span className="text-xs tabular-nums text-ink-faint">
              {formatRange(days[0], days[6])}
            </span>
          </div>

          <div className="mt-4 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 6" />
                <XAxis
                  dataKey="label"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--ink-faint)' }}
                  dy={8}
                />
                <YAxis yAxisId="habits" hide domain={[0, maxDone]} allowDecimals={false} />
                <YAxis
                  yAxisId="mood"
                  orientation="right"
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  width={18}
                  tick={{ fontSize: 10, fill: 'var(--ink-faint)' }}
                />
                <Tooltip cursor={{ fill: 'var(--sunken)', opacity: 0.6 }} content={<WeekTooltip />} />
                <Bar yAxisId="habits" dataKey="done" fill="var(--accent)" radius={6} maxBarSize={18} />
                <Line
                  yAxisId="mood"
                  type="monotone"
                  dataKey="mood"
                  stroke="var(--chart-mood)"
                  strokeWidth={2}
                  connectNulls={false}
                  dot={{ r: 3, fill: 'var(--chart-mood)', strokeWidth: 0 }}
                  activeDot={{ r: 4.5, fill: 'var(--chart-mood)' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-faint">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-accent" aria-hidden="true" />
              Erledigte Habits
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: 'var(--chart-mood)' }}
                aria-hidden="true"
              />
              Stimmung
            </span>
          </div>
        </section>
      ) : (
        <EmptyState
          icon={<IconWeek className="h-6 w-6" />}
          title="Noch keine Daten diese Woche"
          body="Haken ab und Stimmung notieren – hier erscheint dann dein Verlaufschart."
        />
      )}

      {hasData && (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <section
            className="reveal rounded-2xl border border-line bg-surface p-4"
            style={{ '--i': 1 } as CSSProperties}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
              Ø Stimmung
            </p>
            <p className="mt-1.5 font-serif text-[26px] leading-none">
              {avgMood !== null ? avgMood.toFixed(1) : '–'}
              <span className="ml-1 font-sans text-sm text-ink-faint">/ 5</span>
            </p>
          </section>
          <section
            className="reveal rounded-2xl border border-line bg-surface p-4"
            style={{ '--i': 2 } as CSSProperties}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
              Erledigt
            </p>
            <p className="mt-1.5 font-serif text-[26px] leading-none">
              {totalDone}
              <span className="ml-1 font-sans text-sm text-ink-faint">Haken</span>
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
