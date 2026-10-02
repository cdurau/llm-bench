import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Habit, MoodEntry } from '../lib/db.ts';
import { last7Days, shortDayLabel } from '../lib/util.ts';
import { EmptyState } from './EmptyState.tsx';

export function WeekScreen({
  habits,
  moods,
  onAdd,
}: {
  habits: Habit[];
  moods: MoodEntry[];
  onAdd: () => void;
}) {
  const days = last7Days();
  const target = Math.max(1, habits.length);

  const data = days.map((date) => {
    const completed = habits.reduce((n, h) => n + (h.completedDates.includes(date) ? 1 : 0), 0);
    const mood = moods.find((m) => m.date === date)?.value ?? null;
    return { day: shortDayLabel(date), date, completed, remaining: target - completed, mood };
  });

  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const maxMood = 5;

  if (habits.length === 0) {
    return (
      <EmptyState
        title="Noch keine Habits"
        hint="Lege auf dem Heute-Screen dein erstes Habit an. Danach siehst du hier die letzten sieben Tage."
      />
    );
  }

  if (totalCompleted === 0) {
    return (
      <EmptyState
        title="Noch nichts abgeschlossen"
        hint="In den letzten sieben Tagen gibt es noch keine erledigten Habits. Starte heute!"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-muted)]">
        Erledigte Habits pro Tag (Fortschritt zum Tagesziel) und Stimmungsverlauf der letzten 7 Tage.
      </p>
      <div data-testid="week-chart" className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--edge)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--edge)" tickLine={false} />
            <YAxis domain={[0, maxMood]} tick={false} stroke="var(--edge)" tickLine={false} width={8} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '12px',
                fontSize: '13px',
                color: 'var(--ink)',
              }}
              labelStyle={{ color: 'var(--ink-muted)' }}
            />
            <Bar dataKey="completed" stackId="1" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={22} />
            <Bar dataKey="remaining" stackId="1" fill="var(--edge)" barSize={22} />
            <Line
              dataKey="mood"
              type="monotone"
              connectNulls
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--accent-strong)' }}
              stroke="var(--accent-strong)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
