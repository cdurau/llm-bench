import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { getHabitLogs, getMoodLogs } from '../../lib/services';

interface WeekScreenProps {}

const WeekScreen: React.FC<WeekScreenProps> = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const logs = await getHabitLogs();
      const moods = await getMoodLogs();
      
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), i);
        return format(d, 'yyyy-MM-dd');
      }).reverse();

      const data = last7Days.map(dateStr => {
        const dayLogs = logs.filter(log => log.date === dateStr);
        const dayMood = moods.find(m => m.date === dateStr);
        
        return {
          date: format(new Date(dateStr), 'EEE', { locale: de }),
          fullDate: dateStr,
          habitsCompleted: dayLogs.length,
          mood: dayMood ? dayMood.score : null,
        };
      });

      setChartData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Woche</h1>
        <p className="text-[var(--text-muted)]">Deine Fortschritte der letzten 7 Tage</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Habit-Erledigungen</h2>
        <div className="card p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)'
                }}
                itemStyle={{ color: 'var(--accent)' }}
              />
              <Bar dataKey="habitsCompleted" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stimmungsverlauf</h2>
        <div className="card p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="var(--accent)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'var(--accent)' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default WeekScreen;
