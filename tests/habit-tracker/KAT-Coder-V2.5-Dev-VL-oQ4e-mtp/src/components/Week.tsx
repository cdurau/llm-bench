import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getMoodForDate } from '../db'
import { Habit, HabitLog, MoodLog } from '../types'

interface WeekProps {
  habits: Habit[]
  logs: HabitLog[]
  moodLogs?: MoodLog[]
}

export default function Week({ habits, logs, moodLogs = [] }: WeekProps) {
  const weekData = useMemo(() => {
    const days: { label: string; date: string; completed: number; mood?: number }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLogs = logs.filter(l => l.date === dateStr && l.completed)
      const moodLog = moodLogs.find(m => m.date === dateStr)

      days.push({
        label: d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', ''),
        date: dateStr,
        completed: dayLogs.length,
        mood: moodLog?.mood
      })
    }

    return days
  }, [logs, moodLogs])

  const maxHabits = habits.length || 1
  const hasMoodData = moodLogs.length > 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111111] dark:text-white">Woche</h1>

      {/* Habits per day chart */}
      <div className="p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
        <h2 className="text-sm font-medium text-[#787774] uppercase tracking-wider mb-4">Erledigte Habits pro Tag</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#787774', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#787774', fontSize: 12 }}
              domain={[0, maxHabits]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAEAEA',
                borderRadius: '8px',
                fontSize: '13px'
              }}
              labelStyle={{ color: '#111111' }}
            />
            <Bar
              dataKey="completed"
              fill="#111111"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mood trend */}
      <div className="p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
        <h2 className="text-sm font-medium text-[#787774] uppercase tracking-wider mb-4">Stimmungsverlauf</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weekData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#787774', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#787774', fontSize: 12 }}
              domain={[1, 5]}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #EAEAEA',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#111111"
              strokeWidth={2}
              dot={{ fill: '#111111', r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {!hasMoodData && (
          <p className="text-xs text-[#787774] text-center mt-2">Noch keine Stimmungsdaten</p>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#1A1A1A]">
        <h2 className="text-sm font-medium text-[#787774] uppercase tracking-wider mb-3">Übersicht</h2>
        <div className="space-y-2">
          {habits.map(habit => {
            const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed)
            const weekCount = habitLogs.filter(l => {
              const d = new Date(l.date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const weekStart = new Date(today)
              weekStart.setDate(weekStart.getDate() - 6)
              return d >= weekStart
            }).length

            return (
              <div key={habit.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <span>{habit.emoji}</span>
                  <span className="text-[#111111] dark:text-white">{habit.name}</span>
                </span>
                <span className="text-sm text-[#787774]">{weekCount}/7 Tage</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
