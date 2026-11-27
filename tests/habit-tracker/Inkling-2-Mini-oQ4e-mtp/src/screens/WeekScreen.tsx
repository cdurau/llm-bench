import { useMemo, type CSSProperties } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { RhythmData } from '../lib/useRhythmData';
import {
  lastNDays,
  formatDayLabel,
  formatDayFull,
  formatShortDate,
  todayString
} from '../lib/dates';
import { longestStreak } from '../lib/streaks';
import { moodEmoji, moodLabel } from '../lib/moods';
import { Card, Icon, SectionLabel } from '../components/ui';

interface ChartRow {
  date: string;
  day: string;
  full: string;
  completed: number;
  mood: number | null;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartRow }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const mood = row.mood;
  return (
    <div
      className="rounded-xl border border-line bg-card px-3 py-2 shadow-card"
      role="status"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{row.full}</p>
      <p className="mt-1 text-[13px] font-semibold text-ink">
        {row.completed} erledigt
      </p>
      {mood != null && (
        <p className="mt-0.5 text-[12px] font-medium text-muted">
          {moodEmoji(mood)} {moodLabel(mood)}
        </p>
      )}
    </div>
  );
}

export default function WeekScreen({ data }: { data: RhythmData }) {
  const today = todayString();

  const { rows, totalCompleted, avgMood, bestDay, longestEver } = useMemo(() => {
    const dates = lastNDays(7);
    const rows: ChartRow[] = dates.map((date) => ({
      date,
      day: formatDayLabel(date),
      full: formatDayFull(date),
      completed: data.done.get(date)?.size ?? 0,
      mood: data.moods[date]?.mood ?? null
    }));
    const totalCompleted = rows.reduce((sum, r) => sum + r.completed, 0);
    const moods = rows.map((r) => r.mood).filter((m): m is number => m != null);
    const avgMood = moods.length === 0 ? null : moods.reduce((a, b) => a + b, 0) / moods.length;
    const best = rows.reduce((bestRow, r) => (r.completed > bestRow.completed ? r : bestRow), rows[0]);
    // longest streak across all habits
    let longestEver = 0;
    for (const h of data.habits) {
      const datesSet = new Set<string>();
      for (const [date, ids] of data.done) {
        if (ids.has(h.id)) datesSet.add(date);
      }
      longestEver = Math.max(longestEver, longestStreak(datesSet));
    }
    return { rows, totalCompleted, avgMood, bestDay: best, longestEver };
  }, [data.done, data.moods, data.habits]);

  const hasAnyData = totalCompleted > 0 || rows.some((r) => r.mood != null);

  if (!data.ready) {
    return (
      <div className="screen-enter flex flex-col gap-4" aria-busy="true">
        <div className="h-[72px] w-full animate-pulse rounded-2xl bg-subtle" />
        <div className="h-[220px] w-full animate-pulse rounded-2xl bg-subtle" />
        <div className="h-[72px] w-full animate-pulse rounded-2xl bg-subtle" />
      </div>
    );
  }

  const weekDates = lastNDays(7);
  const rangeLabel = `${formatShortDate(weekDates[0])} – ${formatShortDate(weekDates[weekDates.length - 1])}`;

  return (
    <div className="screen-enter flex flex-col gap-4">
      <header style={{ '--i': 0 } as CSSProperties}>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{rangeLabel}</p>
        <h1 className="mt-1 font-serif text-[34px] font-medium leading-tight tracking-tight">
          Woche
        </h1>
      </header>

      {!hasAnyData ? (
        <Card className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-clay-soft text-clay">
            <Icon name="calendar" size={28} strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="font-serif text-[22px] font-medium tracking-tight">Noch keine Daten</h2>
            <p className="mx-auto mt-1.5 max-w-[280px] text-[14px] leading-relaxed text-muted">
              Hast du Gewohnheiten abgehakt oder eine Stimmung gesetzt, siehst du hier die
              Entwicklung deiner Woche.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <section aria-label="Wochenübersicht" style={{ '--i': 1 } as CSSProperties}>
            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <SectionLabel>Letzte 7 Tage</SectionLabel>
                <span className="flex items-center gap-2 text-[11px] font-medium text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[4px] bg-bar" aria-hidden="true" />
                    Erledigt
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-[2.5px] w-4 rounded-full bg-clay" aria-hidden="true" />
                    Stimmung
                  </span>
                </span>
              </div>
              <div className="h-[210px] w-full" role="img" aria-label="Balkendiagramm: erledigte Gewohnheiten pro Tag, Linie: Stimmung">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                      axisLine={{ stroke: 'var(--line)' }}
                      tickLine={false}
                      tickMargin={6}
                    />
                    <YAxis hide domain={[0, Math.max(4, totalCompleted > 0 ? Math.max(...rows.map((r) => r.completed)) : 4)]} />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: 'var(--subtle)' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="completed"
                      name="Erledigt"
                      barSize={22}
                      radius={[6, 6, 6, 6]}
                      fill="var(--bar)"
                    >
                      {rows.map((r) => (
                        <Cell
                          key={r.date}
                          fill={r.date === today ? 'var(--clay)' : 'var(--bar)'}
                        />
                      ))}
                    </Bar>
                    <Line
                      yAxisId="right"
                      dataKey="mood"
                      name="Stimmung"
                      type="monotone"
                      stroke="var(--clay)"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: 'var(--clay)', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: 'var(--clay)', strokeWidth: 0 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                    <YAxis
                      yAxisId="right"
                      hide
                      domain={[0, 5]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section
            aria-label="Statistiken"
            style={{ '--i': 2 } as CSSProperties}
            className="grid grid-cols-3 gap-2.5"
          >
            <div className="rounded-2xl border border-line bg-card p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">7 Tage</p>
              <p className="mt-1 font-serif text-[24px] font-medium leading-none text-ink">
                {totalCompleted}
              </p>
              <p className="mt-1 text-[11px] text-muted">Erledigte Gewohnheiten</p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Ø Stimmung</p>
              <p className="mt-1 font-serif text-[24px] font-medium leading-none text-ink">
                {avgMood != null ? avgMood.toFixed(1) : '–'}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {avgMood != null ? moodLabel(Math.round(avgMood)) : 'Keine Daten'}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Rekord</p>
              <p className="mt-1 font-serif text-[24px] font-medium leading-none text-ink">
                {longestEver > 0 ? `${longestEver}` : '–'}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {longestEver > 0 ? (longestEver === 1 ? 'Tag Serie' : 'Tage Serie') : 'Noch keine'}
              </p>
            </div>
          </section>

          {bestDay && bestDay.completed > 0 && (
            <p
              style={{ '--i': 3 } as CSSProperties}
              className="flex items-center justify-center gap-1.5 text-[13px] text-muted"
            >
              <Icon name="sparkle" size={14} className="text-clay" strokeWidth={2.4} />
              Bester Tag: {bestDay.full} · {bestDay.completed} erledigt
            </p>
          )}
        </>
      )}
    </div>
  );
}
