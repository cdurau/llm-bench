import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { db } from '../database';
import { Card } from '../components/ui/Card';
import { getMoodEmoji } from '../lib/utils';

export function WeekScreen() {
  const [weeklyData, setWeeklyData] = useState({
    dates: [] as string[],
    completedCounts: [] as number[],
    moods: [] as (number | null)[],
  });

  useEffect(() => {
    loadWeeklyData();
  }, []);

  async function loadWeeklyData() {
    const data = await db.getWeeklyData(7);
    setWeeklyData(data);
  }

  const chartData = weeklyData.dates.map((date, i) => ({
    date: new Date(date).toLocaleDateString('de-DE', { weekday: 'short' }),
    erledigt: weeklyData.completedCounts[i],
    stimmung: weeklyData.moods[i] || 0,
  }));

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Woche</h2>

      {/* Stimmungs-Chart */}
      <Card>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stimmung (1-5)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStimmung" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[1, 5]} 
                  tickCount={5}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => getMoodEmoji(value as number)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  itemStyle={{ color: '#8884d8', fontSize: 14 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="stimmung" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  fill="url(#colorStimmung)" 
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Habits Chart */}
      <Card>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habit-Status (7 Tage)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 1]} 
                  tickCount={2}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  itemStyle={{ color: '#10b981', fontSize: 14 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="erledigt" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 3, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
