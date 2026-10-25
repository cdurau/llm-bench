import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '../store'
import { last7Days, fmtWeekdayShort } from '../lib/dates'
import { accentHex, getColor } from '../lib/colors'
import EmptyState from './EmptyState'

export default function Week() {
  const { today, completions, moods, effectiveTheme } = useStore()
  const days = last7Days()

  const data = days.map((d) => ({
    label: fmtWeekdayShort(d),
    done: completions.filter((c) => c.date === d).length,
    mood: moods[d]?.value ?? null,
  }))

  const hasData = data.some((d) => d.done > 0 || d.mood != null)

  return (
    <section className="pb-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text)]">
          Letzte 7 Tage
        </h1>
        <p className="mt-2 text-sm font-medium text-[var(--muted)]">
          Erledigte Habits und Stimmung
        </p>
      </header>

      {!hasData ? (
        <EmptyState
          title="Noch keine Daten"
          text="Wenn du Habits abhakst oder deine Stimmung festlegst, zeigt diese Seite den Verlauf der letzten Woche."
        />
      ) : (
        <div
          data-testid="week-chart"
          className="card mt-8 p-5"
          style={{ height: 260 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  color: 'var(--text)',
                }}
              />
              <Bar
                dataKey="done"
                name="Erledigt"
                fill={accentHex(effectiveTheme)}
                radius={[6, 6, 0, 0]}
                max={6}
              />
              <Line
                dataKey="mood"
                name="Stimmung"
                type="monotone"
                stroke={effectiveTheme === 'dark' ? getColor('amber').dark : getColor('amber').light}
                strokeWidth={2}
                dot={{ r: 4, fill: getColor('amber').light }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}