import { useMemo } from 'react'
import { useHabits } from '../hooks'
import { useMood } from '../hooks'
import { getLast7Days, getDayLabel } from '../db'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts'

interface HabitDataPoint {
  date: string
  done: number
  label: string
}

interface MoodDataPoint {
  date: string
  mood: number | null
  label: string
}

export default function Week() {
  const { habits, completions } = useHabits()
  const { moods } = useMood()
  const days = getLast7Days()

  const habitData: HabitDataPoint[] = useMemo(() => {
    return days.map((date) => {
      const count = completions.filter((c) => c.date === date).length
      return { date, done: count, label: getDayLabel(date) }
    })
  }, [days, completions])

  const moodData: MoodDataPoint[] = useMemo(() => {
    return days.map((date) => {
      const m = moods.find((m) => m.date === date)
      return { date, mood: m?.value ?? null, label: getDayLabel(date) }
    })
  }, [days, moods])

  const emptyHabits = habits.length === 0
  const emptyMoods = moods.length === 0

  return (
    <div className="px-5 pt-12 pb-4">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-stone-900 dark:text-stone-100">
          Diese Woche
        </h1>
        <p className="text-stone-400 dark:text-stone-500 mt-1 text-sm">
          {days[0]} bis {days[6]}
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
          Erledigte Habits
        </h2>
        {emptyHabits ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300 dark:text-stone-600">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Keine Habits vorhanden. Lege sie in den Einstellungen an.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={habitData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-stone-200 dark:text-stone-800" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, Math.max(habits.length, 3)]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'currentColor',
                    color: '#1c1917',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value: unknown) => [`${String(value)} von ${habits.length}`, 'Erledigt']}
                />
                <Bar
                  dataKey="done"
                  fill="currentColor"
                  className="text-stone-800 dark:text-stone-200"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">
          Stimmung
        </h2>
        {emptyMoods ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-300 dark:text-stone-600">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Keine Stimmungsdaten. Trage sie im Heute-Screen ein.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={moodData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-stone-200 dark:text-stone-800" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'currentColor',
                    color: '#1c1917',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: 12,
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value: unknown) => [value == null ? '—' : `${String(value)} / 5`, 'Stimmung']}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'currentColor', stroke: 'none' }}
                  activeDot={{ r: 6 }}
                  className="text-amber-500 dark:text-amber-400"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
