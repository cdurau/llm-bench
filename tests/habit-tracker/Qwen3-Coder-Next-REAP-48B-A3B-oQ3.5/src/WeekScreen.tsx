import { useEffect, useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as db from './db'
import type { Habit } from './types'

type Mood = any

export default function WeekScreen() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const habitsData = await db.getHabits()
      setHabits(habitsData)

      // Get moods from indexedDB
      const request = indexedDB.open('rhythm-db', 1)
      const dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      })
      const dbInstance = await dbPromise
      const tx = dbInstance.transaction('moods', 'readonly')
      const store = tx.objectStore('moods')
      const req = store.getAll()
      req.onerror = () => {}
      req.onsuccess = () => setMoods(req.result)

      setLoading(false)
    }
    loadData()
  }, [])

  const weekDates = db.getWeekDates()

  const chartData = weekDates.map((date) => ({
    date,
    habits: 0,
    mood: moods.find((m: any) => m.date === date)?.value || 0,
  }))

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">This Week</h1>
        <p className="text-lg opacity-70">Track your habits over the last 7 days</p>
      </header>

      <div
        data-testid="week-chart"
        className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-lg"
      >
        {habits.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
            <p className="opacity-70">Complete some habits to see your progress chart</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="opacity(0.2)" />
                <XAxis dataKey="date" stroke="currentColor" opacity="0.7" />
                <YAxis stroke="currentColor" opacity="0.7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '1rem',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="habits"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Habits Completed"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#10b840"
                  strokeWidth={2}
                  name="Stimmungs Rating"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Habit Summary</h3>
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between bg-surface dark:bg-surface-dark rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{habit.emoji}</span>
                <span>{habit.name}</span>
              </div>
              <span className="font-medium">
                Streak: {habit.streak} | Best: {habit.maxStreak}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
