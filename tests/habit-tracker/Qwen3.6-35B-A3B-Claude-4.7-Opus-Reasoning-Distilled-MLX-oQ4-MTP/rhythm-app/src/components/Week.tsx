import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  lastXDays,
  getMoodEntry,
  today,
  getChecksForDate,
  getHabits,
} from '../lib/db';
import { MOOD_EMOJIS, moodLabel } from '../lib/mood';
import { calcDailyStats } from '../lib/streaks';
import type { Habit, MoodEntry, MoodValue } from '../lib/types';

export function Week() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [data, setData] = useState<Record<string, number>>({});
  const [moods, setMoods] = useState<Record<string, MoodEntry>>({});
  const days = lastXDays(7);
  const labels = days.map((d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('de-DE', { weekday: 'short' }).charAt(0).toUpperCase();
  });

  useEffect(() => {
    (async () => {
      const h = await getHabits();
      const checksByDay = await Promise.all(
        days.map((d) => getChecksForDate(d))
      );
      const counts = calcDailyStats(
        checksByDay.flatMap((ids: {habitId: string}[], i: number) =>
          ids.map((habId: {habitId: string}) => ({ habitId: habId.habitId, date: days[i] }))
        )
      );
      const moodEntries = await Promise.all(
        days.map((d) => getMoodEntry(d))
      );
      setHabits(h);
      setData(counts);
      setMoods(
        Object.fromEntries(
          moodEntries.filter(Boolean).map((m) => [m!.date, m!])
        )
      );
    })();
  }, []);

  const chartData = days.map((d) => ({
    label: labels[days.indexOf(d)],
    date: d,
    checked: data[d] || 0,
    mood: moods[d]?.mood,
  }));

  const maxChecked = habits.length > 0 ? habits.length : 3;
  const totalChecked = chartData.reduce((s, d) => s + d.checked, 0);
  const moodEntries = Object.values(moods);
  const avgMood =
    moodEntries.length > 0
      ? moodEntries.reduce((s, m) => s + m.mood, 0) / moodEntries.length
      : 0;

  const todayStr = today();

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h2 className="text-base mb-4">Wochenübersicht</h2>

      <div className="mb-3">
        <div className="flex justify-between text-[12px] text-neutral-500 mb-3">
          <span>{totalChecked} abgehakt</span>
          {avgMood > 0 && (
            <span className="text-neutral-600">
              {MOOD_EMOJIS[Math.round(avgMood) as MoodValue]} {moodLabel(Math.round(avgMood) as MoodValue)}
            </span>
          )}
        </div>
        <div style={{ height: 170 }} className="px-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tick={{ fontSize: 11, fill: '#78716c' }}
              />
              <YAxis
                axisLine={false}
                tick={false}
                domain={[0, maxChecked]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = (payload[0].payload as typeof chartData[number]);
                  return (
                    <div
                      style={{
                        padding: '8px 12px',
                        fontSize: 13,
                        backgroundColor: '#fff',
                        border: '1px solid #e7e5e4',
                        borderRadius: 8,
                      }}
                    >
                      <p style={{ fontWeight: 500 }}>{p.label} — {p.checked} erledigt</p>
                      {p.mood && (
                        <p className="text-neutral-500">
                          {MOOD_EMOJIS[p.mood]} {moodLabel(p.mood)}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="checked"
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={entry.date === todayStr ? '#4a6fa5' : '#1c1917'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {Object.keys(moods).length > 0 && (
        <div className="mb-5">
          <p className="text-[12px] uppercase tracking-[0.08em] text-neutral-500 mb-2">
            Stimmungen
          </p>
          <div className="flex gap-3 flex-wrap">
            {days
              .filter((d) => moods[d])
              .map((d) => {
                const m = moods[d]!;
                return (
                  <span
                    key={d}
                    title={m.note || moodLabel(m.mood)}
                    className="text-lg"
                  >
                    {MOOD_EMOJIS[m.mood]}
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
