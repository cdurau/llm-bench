import { useEffect, useState } from 'react'
import { db } from '../services/db'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LineChart as LineChartIcon, BarChart3 as BarChartIcon } from 'lucide-react'

interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

interface WeekScreenProps {
  habits: Habit[]
  onToggleHabit?: (id: string, date: string) => void
}

export default function WeekScreen({ habits }: WeekScreenProps) {
  const [data, setData] = useState<any[]>([])
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  useEffect(() => {
    const generateWeekData = async () => {
      const today = new Date()
      const weekData = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' })

        let habitCompletions = 0
        for (const habit of habits) {
          const completion = await db.completions
            .where({ habitId: habit.id, date: dateStr })
            .first()
          if (completion) habitCompletions++
        }

        weekData.push({
          day: dayName,
          completions: habitCompletions,
          dateString: dateStr
        })
      }

      setData(weekData)
    }

    generateWeekData()
  }, [habits])

  const chartData = data.map(d => ({
    ...d,
    completed: d.completions,
    total: habits.length,
    moodValue: null // Will be filled by useEffect below
  }))

  // Load mood data for the chart
  useEffect(() => {
    const moodData = data.map(async (d) => {
      const moods = await db.moods.where('date').equals(d.dateString).toArray()
      return {
        ...d,
        moodValue: moods.length > 0 ? moods[0].value : null
      }
    })

    Promise.all(moodData).then(updatedData => setData(updatedData))
  }, [habits])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Diese Woche
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`icon-btn ${chartType === 'bar' ? 'bg-primary-100 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : ''}`}
            aria-label="Bar chart"
          >
            <BarChartIcon size={20} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`icon-btn ${chartType === 'line' ? 'bg-primary-100 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : ''}`}
            aria-label="Line chart"
          >
            <LineChartIcon size={20} />
          </button>
        </div>
      </div>

      {/* Habit Completion Chart */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Erledigte Habits (letzte 7 Tage)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ fontSize: 14 }}
              />
              <Bar dataKey="completed" fill="#14b8a6" radius={[8, 8, 0, 0]} maxBarSize={60} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ fontSize: 14 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ fill: '#14b8a6', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Mood Chart */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Stimmungsverlauf (letzte 7 Tage)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[1, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ fontSize: 14 }}
            />
            <Bar dataKey="moodValue" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Stats */}
      <div className="space-y-3">
        {data.map((dayData) => (
          <div
            key={dayData.dateString}
            className="card p-4 flex items-center justify-between"
          >
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {dayData.day}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                {dayData.dateString}
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dayData.completions}/{habits.length} Habits
              </span>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                💬 {dayData.moodValue > 0 ? `${dayData.moodValue}/5` : 'keine'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
