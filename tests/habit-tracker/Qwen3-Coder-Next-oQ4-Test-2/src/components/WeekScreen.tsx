import { useState, useEffect, useCallback } from 'react'
import { getWeekData, setMood } from '../db'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

export default function WeekScreen() {
  const [data, setData] = useState<{ date: string; completed: number; mood: number | null }[]>([])
  const [loading, setLoading] = useState(true)
  
  // Woche's Daten laden
  const loadData = useCallback(async () => {
    try {
      const weekData = await getWeekData()
      setData(weekData)
    } catch (error) {
      console.error('Fehler beim Laden der Woche:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadData()
  }, [loadData])
  
  // Mood setzen
  const handleMoodSelect = async (value: number) => {
    try {
      const date = new Date().toISOString().split('T')[0]
      await setMood(date, value)
      await loadData()
    } catch (error) {
      console.error('Fehler beim Setzen der Stimmung:', error)
    }
  }
  
  // Heute's Stimmung
  const todayMood = data.length > 0 ? data[data.length - 1]?.mood : null
  
  // Datum formatieren
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { weekday: 'short' })
  }
  
  // Mood Farbe
  const getMoodColor = (value: number) => {
    const colors = ['#D62828', '#F77F00', '#FCAF45', '#2A9D8F', '#2A9D8F']
    return colors[value - 1]
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-secondary">Laden...</div>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Woche</h2>
      
      {/* Heute's Stimmung */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Heute's Stimmung</h3>
        <div className="flex justify-between items-center p-4 rounded-3xl bg-surface">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-text-secondary">Wie fühlst du dich heute?</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Stimmungswahl">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  data-testid={`mood-${value}`}
                  role="radio"
                  aria-checked={todayMood === value}
                  onClick={() => handleMoodSelect(value)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 ${
                    todayMood === value 
                      ? `scale-110 ring-2 ring-offset-2 ring-accent` 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: todayMood === value ? getMoodColor(value) : '',
                    color: todayMood === value ? '#FFFFFF' : ''
                  }}
                >
                  {['😡', '😢', '😐', '🙂', '😄'][value - 1]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Chart */}
      <section data-testid="week-chart">
        <h3 className="text-lg font-semibold mb-3">Letzte 7 Tage</h3>
        <div className="rounded-3xl bg-surface p-4">
          {data.length === 0 || data.every(d => d.completed === 0 && d.mood === null) ? (
            <div className="empty-state py-8">
              <p>Noch keine Daten für dieses Wochen</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                  tickCount={6}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  name="Erledigte Habits" 
                  fill="#346538"
                  radius={[8, 8, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  )
}
