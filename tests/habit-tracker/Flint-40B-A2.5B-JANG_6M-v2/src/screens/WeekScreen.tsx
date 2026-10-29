import WeekChart, { MoodChart, type WeekDayPoint } from '../components/WeekChart';
import { useAppData } from '../hooks/useAppData';
import { dateKey, lastNDays } from '../lib/date';

export default function WeekScreen() {
  const { habits, moods, isDone } = useAppData();
  const days = lastNDays(7);

  const data: WeekDayPoint[] = days.map((d) => {
    const key = dateKey(d);
    const moodEntry = moods.find((m) => m.date === key);
    return {
      key,
      done: habits.filter((h) => isDone(h.id, key)).length,
      mood: moodEntry?.value,
    };
  });

  return (
    <div>
      <header>
        <h1 className="font-serif text-3xl tracking-[-0.02em] text-ink">Diese Woche</h1>
        <p className="mt-1 text-sm text-muted">Die letzten sieben Tage.</p>
      </header>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5" aria-label="Erledigte Habits">
        <h2 className="font-serif text-xl text-ink">Erledigte</h2>
        <p className="mt-1 text-sm text-muted">Wie viele Habits du pro Tag geschafft hast.</p>
        <div className="mt-4">
          {habits.length === 0 ? (
            <p className="text-sm text-muted">Noch keine Habits angelegt.</p>
          ) : (
            <WeekChart data={data} />
          )}
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-surface p-5" aria-label="Stimmung">
        <h2 className="font-serif text-xl text-ink">Stimmung</h2>
        <p className="mt-1 text-sm text-muted">Wie es dir in den letzten Tagen ergangen ist.</p>
        <div className="mt-4">
          <MoodChart data={data} />
        </div>
      </section>
    </div>
  );
}