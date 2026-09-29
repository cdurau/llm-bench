import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import type { DataLayer } from '../hooks/useData'
import type { ThemeController } from '../hooks/useTheme'
import { formatDayMonth, lastNDays, weekdayShort } from '../lib/date'
import { EmptyState } from './EmptyState'

const ACCENT = '#4a6a4f'
const ACCENT_SOFT = '#8fae86'

export function Week({
  data,
  theme,
}: {
  data: DataLayer
  theme: ThemeController
}) {
  const keys = lastNDays(7)

  const chartData = keys.map((key) => {
    const done = data.habits.filter((h) => data.isDone(h.id, key)).length
    const mood = data.moodByKey.get(key)?.mood
    return {
      key,
      label: `${weekdayShort(key)}\n${formatDayMonth(key).replace(/ \d{2}\./, '')}`,
      completions: done,
      mood: mood ?? null,
    }
  })

  const weekCompletions = data.completions.filter((c) =>
    keys.includes(c.date),
  ).length
  const moodsThisWeek = keys.filter((k) => data.moodByKey.has(k)).length

  if (data.habits.length === 0 && data.moods.length === 0) {
    return (
      <EmptyState
        title="Noch keine Daten"
        description="Sobald du Habits abhakest und deine Stimmung einträgst, erscheint hier der Verlauf der letzten sieben Tage."
      />
    )
  }

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Wochenrückblick</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Letzte 7 Tage · {weekCompletions} erledigt · {moodsThisWeek} Stimmungs-Einträge
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-ink-muted)]">
          Erledigte Habits pro Tag
        </h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={26}>
              <CartesianGrid
                vertical={false}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6f6d69' }}
                dy={8}
              />
              <Tooltip
                contentStyle={{
                  background: theme.isDark ? '#232220' : '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  fontSize: 13,
                }}
                cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }}
              />
              <Bar
                dataKey="completions"
                fill={ACCENT}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-ink-muted)]">
          Stimmung
        </h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                vertical={false}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6f6d69' }}
                dy={8}
              />
              <Tooltip
                contentStyle={{
                  background: theme.isDark ? '#232220' : '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke={ACCENT_SOFT}
                strokeWidth={2.5}
                dot={{ r: 4, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {data.moods.length === 0 && (
          <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
            Keine Stimmungseinträge in den letzten 7 Tagen.
          </p>
        )}
      </section>
    </div>
  )
}
