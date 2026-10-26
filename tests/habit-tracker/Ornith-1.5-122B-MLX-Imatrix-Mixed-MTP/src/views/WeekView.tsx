import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { EmptyState } from '../components/EmptyState'
import { ChartIcon } from '../components/Icons'
import { lastNDays, weekdayShort } from '../date'
import { cssVar } from '../cssVar'
import type { Snapshot } from '../store'

interface DayStat {
  key: string
  weekday: string
  day: number
  completed: number
  mood: number | null
}

interface WeekViewProps {
  data: Snapshot
}

export function WeekView({ data }: WeekViewProps) {
  const days = lastNDays(7)

  const stats = useMemo<DayStat[]>(() => {
    const completedByDay = new Map<string, number>()
    for (const c of data.completions) {
      completedByDay.set(c.day, (completedByDay.get(c.day) ?? 0) + 1)
    }
    const moodByDay = new Map(data.moods.map((m) => [m.day, m.value] as const))

    return days.map((d) => {
      const key = d.toISOString().slice(0, 10)
      return {
        key,
        weekday: weekdayShort(d),
        day: d.getDate(),
        completed: completedByDay.get(key) ?? 0,
        mood: moodByDay.get(key) ?? null,
      }
    })
  }, [data.completions, data.moods, days])

  const hasData = stats.some((s) => s.completed > 0 || s.mood != null)

  const accent = cssVar('--accent', '#5e8c61')
  const lineColor = cssVar('--ink', '#26241f')
  const gridColor = cssVar('--border', '#e7e2d8')
  const muted = cssVar('--muted', '#8a8578')

  if (!hasData) {
    return (
      <EmptyState
        icon={<ChartIcon width={30} height={30} />}
        title="Noch keine Daten"
        hint="Erledige Habits oder notiere deine Stimmung — dann erscheint hier die Woche."
      />
    )
  }

  const maxCompleted = Math.max(1, ...stats.map((s) => s.completed))

  return (
    <div className="animate-rise space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold" style={{ letterSpacing: '-0.02em' }}>
          Diese Woche
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Letzte 7 Tage · erledigte Habits und Stimmung
        </p>
      </header>

      <section className="surface rounded-[24px] p-5">
        <div className="mb-3 flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: accent }} />
            Erledigte Habits
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-0.5 w-3 rounded" style={{ background: lineColor }} />
            Stimmung
          </span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={stats} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
            <XAxis dataKey="weekday" tickLine={false} axisLine={false} tick={{ fill: muted, fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: muted, fontSize: 11 }}
              domain={[0, maxCompleted]}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[1, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: muted, fontSize: 11 }}
              width={24}
            />
            <CartesianGrid stroke={gridColor} strokeDasharray="3 6" vertical={false} />
            <Bar yAxisId="left" dataKey="completed" fill={accent} radius={[6, 6, 6, 6]} barSize={22} />
            <Line
              yAxisId="right"
              dataKey="mood"
              type="monotone"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--surface)', stroke: lineColor, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--ink)',
              }}
              formatter={(val: unknown, name: string) => {
                const v = typeof val === 'number' ? val : '—'
                return [name === 'mood' ? `Stimmung ${v}` : `${v} erledigt`, name === 'mood' ? 'Stimmung' : 'Erledigt']
              }}
              labelFormatter={(label: string) => `Tag ${label}`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <p className="px-1 text-xs" style={{ color: muted }}>
        Stimmung: 1 = schwer, 5 = herrlich.
      </p>
    </div>
  )
}
