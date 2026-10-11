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
import { useRhythm } from '../store'
import { useTheme } from '../lib/theme'
import { formatShortDate, formatWeekRange, formatWeekdayShort, lastNDays } from '../lib/dates'
import { moodByValue } from '../lib/palette'
import { EmptyState } from './EmptyState'

interface DayDatum {
  key: string
  label: string
  done: number
  total: number
  mood: number | null
}

interface WeekTooltipProps {
  active?: boolean
  payload?: Array<{ dataKey?: string; value?: number | string; payload?: DayDatum }>
  total: number
}

/** Dezenter Tooltip im Karten-Stil des App. */
function WeekTooltip({ active, payload, total }: WeekTooltipProps) {
  if (!active || !payload?.length) return null
  const datum = payload[0]?.payload
  const done = Number(payload.find((p) => p.dataKey === 'done')?.value ?? 0)
  const moodRaw = payload.find((p) => p.dataKey === 'mood')?.value
  const mood = moodRaw === null || moodRaw === undefined ? null : Number(moodRaw)
  return (
    <div className="rounded-[10px] border border-line bg-surface px-3.5 py-2.5 shadow-soft">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
        {datum ? formatShortDate(datum.key) : ''}
      </p>
      <p className="mt-1 text-[13px] font-medium text-ink">
        {done} von {total} Gewohnheiten
      </p>
      <p className="mt-0.5 text-[13px] text-muted">
        {mood === null ? 'Keine Stimmung' : `${moodByValue(mood).emoji} ${moodByValue(mood).label}`}
      </p>
    </div>
  )
}

/** Liefert true, wenn b der Kalender-Tag direkt nach a liegt. */
function isNextDay(a: string, b: string): boolean {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const da = new Date(ay, am - 1, ad)
  const db = new Date(by, bm - 1, bd)
  da.setDate(da.getDate() + 1)
  return da.getTime() === db.getTime()
}

/** Woche-Screen: Chart der letzten 7 Tage (Habits pro Tag + Stimmungsverlauf). */
export function WeekScreen({ onGoToToday }: { onGoToToday: () => void }) {
  const { habits, completions, moods } = useRhythm()
  const { mode } = useTheme()

  const days = useMemo(() => lastNDays(7), [])
  const moodByDate = useMemo(() => new Map(moods.map((m) => [m.date, m.value])), [moods])
  const doneByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of completions) map.set(c.date, (map.get(c.date) ?? 0) + 1)
    return map
  }, [completions])

  const data: DayDatum[] = days.map((key) => ({
    key,
    label: formatWeekdayShort(key),
    done: doneByDate.get(key) ?? 0,
    total: habits.length,
    mood: moodByDate.get(key) ?? null,
  }))

  const weekDone = data.reduce((sum, d) => sum + d.done, 0)
  const moodValues = data.map((d) => d.mood).filter((v): v is number => v !== null)
  const avgMood =
    moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : null

  // Längste Serie über alle Habits zusammen: Tage, an denen mindestens eines erledigt wurde.
  const bestStreak = useMemo(() => {
    const dates = [...new Set(completions.map((c) => c.date))].sort()
    let best = 0
    let run = 0
    let previous: string | null = null
    for (const date of dates) {
      run = previous !== null && isNextDay(previous, date) ? run + 1 : 1
      if (run > best) best = run
      previous = date
    }
    return best
  }, [completions])

  // Chart-Farben folgen dem aktiven Modus.
  const c =
    mode === 'dark'
      ? { grid: '#2a2926', tick: '#8d8c86', bar: '#f2f1ec', line: '#dd8a5e' }
      : { grid: '#eaeaea', tick: '#a3a29d', bar: '#111111', line: '#a2491f' }

  return (
    <div className="space-y-6">
      <header className="rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Woche</p>
        <h1 className="mt-2 font-serif text-[30px] leading-tight font-semibold tracking-[-0.02em] text-ink">
          {formatWeekRange(days[0], days[days.length - 1])}
        </h1>
      </header>

      {habits.length === 0 ? (
        <EmptyState
          index={1}
          title="Noch nichts für die Woche"
          text="Sobald du Gewohnheiten abhakst und deine Stimmung notierst, formt sich hier dein Wochenrhythmus."
          action={
            <button
              type="button"
              onClick={onGoToToday}
              className="min-h-11 rounded-[6px] bg-ink px-5 text-sm font-medium text-canvas transition-transform active:scale-[0.98]"
            >
              Zu „Heute“
            </button>
          }
        />
      ) : weekDone === 0 && moodValues.length === 0 ? (
        <EmptyState
          index={1}
          title="Diese Woche ist noch leer"
          text="Deine ersten Abhaken und Stimmungen erscheinen ab heute im Chart."
        />
      ) : (
        <section
          aria-label="Wochen-Chart"
          className="rise rounded-card border border-line bg-surface p-5 shadow-soft"
          style={{ '--index': 1 } as CSSProperties}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">Diese Woche</h2>
            <div className="flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: c.bar }} />
                Habits
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: c.line }} />
                Stimmung
              </span>
            </div>
          </div>

          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: c.tick, fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  yAxisId="habits"
                  domain={[0, Math.max(habits.length, 5)]}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={22}
                  tick={{ fill: c.tick, fontSize: 10 }}
                />
                <YAxis
                  yAxisId="mood"
                  orientation="right"
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  axisLine={false}
                  tickLine={false}
                  width={22}
                  tick={{ fill: c.tick, fontSize: 10 }}
                />
                <Tooltip
                  content={<WeekTooltip total={habits.length} />}
                  cursor={{ fill: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(17,17,17,0.03)' }}
                />
                <Bar
                  yAxisId="habits"
                  dataKey="done"
                  fill={c.bar}
                  radius={[6, 6, 0, 0]}
                  barSize={22}
                />
                <Line
                  yAxisId="mood"
                  type="monotone"
                  dataKey="mood"
                  stroke={c.line}
                  strokeWidth={2}
                  connectNulls={false}
                  dot={{ r: 3, fill: c.line, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <dl className="mt-5 flex justify-between gap-3 border-t border-line pt-4">
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
                Erledigt
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-ink">
                {weekDone} von {habits.length * 7}
              </dd>
            </div>
            <div className="text-right">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
                Ø Stimmung
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-ink">
                {avgMood === null ? '–' : avgMood.toFixed(1).replace('.', ',')}
              </dd>
            </div>
            <div className="text-right">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint">
                Beste Serie
              </dt>
              <dd className="mt-1 text-[15px] font-medium text-ink">
                {bestStreak === 0 ? '–' : `${bestStreak} Tage`}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
