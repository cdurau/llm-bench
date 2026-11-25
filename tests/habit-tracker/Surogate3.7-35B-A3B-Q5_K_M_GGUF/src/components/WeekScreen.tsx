// --- Screen: Woche (Week) ---

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import * as db from '../db';
import { useHabits } from '../useHabits';
import { lastNDates, formatWeekday, formatDay } from '../utils';
import { EmptyState } from './EmptyState';
import { IconChart } from './Icons';

interface Row {
  date: string;
  weekday: string;
  day: string;
  completed: number;
  total: number;
  mood: number | null;
  moodLabel: string;
}

const MOOD_LABELS = ['', 'Sehr schlecht', 'Schlecht', 'Neutral', 'Gut', 'Sehr gut'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {p.name === 'mood' ? (
        <p className="text-ink-muted">{p.value ? `${p.value}/5 – ${MOOD_LABELS[p.value]}` : 'keine Stimmung'}</p>
      ) : (
        <p className="text-ink-muted">{p.value} von {label?.total ?? p.payload?.total ?? ''} Habits</p>
      )}
    </div>
  );
}

export function WeekScreen() {
  const { habits } = useHabits();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const dates = lastNDates(7);
      const total = habits.length;

      const moodMap = await db.getAllMoods();
      const moodByDate = new Map(moodMap.map((m) => [m.date, m.value]));

      dates.map(async (date) => {
        let completed = 0;
        for (const h of habits) {
          const set = await db.getCompletedDates(h.id, [date]);
          if (set.has(date)) completed++;
        }
        const mood = moodByDate.get(date) ?? null;
        const newRow: Row = {
          date,
          weekday: formatWeekday(date),
          day: formatDay(date),
          completed,
          total,
          mood,
          moodLabel: mood ? MOOD_LABELS[mood] : '',
        };
        setRows((prev) => {
          const idx = prev.findIndex((r) => r.date === date);
          if (idx === -1) return [...prev, newRow];
          const copy = [...prev];
          copy[idx] = newRow;
          return copy;
        });
        return newRow;
      });

      if (!cancelled) {
        setRows((prev) => {
          const out: Row[] = [];
          for (const r of dates) {
            const existing = prev.find((p) => p.date === r);
            out.push(existing ?? { date: r, weekday: '', day: '', completed: 0, total, mood: null, moodLabel: '' });
          }
          return out;
        });
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [habits]);

  const weekTotal = useMemo(() => rows.reduce((s, r) => s + r.completed, 0), [rows]);
  const weekPct = useMemo(() => {
    const max = rows.reduce((s, r) => s + r.total, 0) || 1;
    return Math.round((weekTotal / max) * 100);
  }, [weekTotal, rows]);

  const avgMood = useMemo(() => {
    const vals = rows.filter((r) => r.mood != null).map((r) => r.mood as number);
    return vals.length === 0 ? null : Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }, [rows]);

  const chartData = rows;

  return (
    <div className="px-5 pt-6 pb-28 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-faint font-semibold mb-1">Letzte 7 Tage</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Wochenrückblick</h1>
      </div>

      {loading ? (
        <div className="h-64 bg-surface rounded-lg border border-border animate-pulse" />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={<IconChart className="w-8 h-8" />}
          title="Keine Daten"
          description="Sobald du Habits abhakest, erscheint hier dein Wochenverlauf."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-lg border border-border p-4 shadow-card">
              <p className="text-xs text-ink-faint mb-1">Erledigt</p>
              <p className="text-2xl font-bold text-ink">{weekTotal}</p>
              <p className="text-xs text-ink-muted">{rows.length} Tage</p>
            </div>
            <div className="bg-surface rounded-lg border border-border p-4 shadow-card">
              <p className="text-xs text-ink-faint mb-1">Quote</p>
              <p className="text-2xl font-bold text-accent-text">{weekPct}%</p>
            </div>
            <div className="bg-surface rounded-lg border border-border p-4 shadow-card">
              <p className="text-xs text-ink-faint mb-1">Ø Stimmung</p>
              <p className="text-2xl font-bold text-ink">{avgMood ?? '—'}</p>
              {avgMood != null && <p className="text-xs text-ink-muted">{avgMood >= 4 ? '😄' : avgMood >= 3 ? '🙂' : '😕'}</p>}
            </div>
          </div>

          {/* Habits per day chart */}
          <div className="bg-surface rounded-lg border border-border p-5 shadow-card animate-fade-in">
            <h2 className="text-sm uppercase tracking-wide text-ink-faint font-semibold mb-5">Erledigte Habits pro Tag</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,119,116,0.12)" vertical={false} />
                  <XAxis dataKey="weekday" tick={{ fontSize: 12, fill: '#787774' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#787774' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.completed === entry.total && entry.total > 0 ? '#3A6B5A' : '#C9A26E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood chart */}
          <div className="bg-surface rounded-lg border border-border p-5 shadow-card animate-fade-in">
            <h2 className="text-sm uppercase tracking-wide text-ink-faint font-semibold mb-5">Stimmungsverlauf</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,119,116,0.12)" vertical={false} />
                  <XAxis dataKey="weekday" tick={{ fontSize: 12, fill: '#787774' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#787774' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="mood" stroke="#5E6B8A" strokeWidth={2.5} dot={{ r: 4, fill: '#5E6B8A', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
