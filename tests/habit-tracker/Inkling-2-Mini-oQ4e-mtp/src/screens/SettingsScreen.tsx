import { useMemo, useState, type CSSProperties } from 'react';
import type { RhythmData } from '../lib/useRhythmData';
import { currentStreak, longestStreak } from '../lib/streaks';
import { todayString } from '../lib/dates';
import { habitChipVars } from '../lib/colors';
import { Card, Icon, GhostButton, PrimaryButton, SectionLabel } from '../components/ui';
import HabitEditor, { type HabitDraft } from '../components/HabitEditor';
import type { Habit, ThemePreference } from '../lib/types';

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: 'monitor' | 'sun' | 'moon' }[] = [
  { id: 'system', label: 'System', icon: 'monitor' },
  { id: 'light', label: 'Hell', icon: 'sun' },
  { id: 'dark', label: 'Dunkel', icon: 'moon' }
];

export default function SettingsScreen({
  data,
  themePref,
  onThemeChange
}: {
  data: RhythmData;
  themePref: ThemePreference;
  onThemeChange: (t: ThemePreference) => void;
}) {
  const [editing, setEditing] = useState<Habit | 'new' | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exported, setExported] = useState(false);
  const today = todayString();

  const habitStats = useMemo(() => {
    return data.habits.map((h) => {
      const dates = new Set<string>();
      for (const [date, ids] of data.done) {
        if (ids.has(h.id)) dates.add(date);
      }
      return { habit: h, current: currentStreak(dates, today), longest: longestStreak(dates) };
    });
  }, [data.habits, data.done, today]);

  if (!data.ready) {
    return (
      <div className="screen-enter flex flex-col gap-4" aria-busy="true">
        <div className="h-[64px] w-full animate-pulse rounded-2xl bg-subtle" />
        <div className="h-[88px] w-full animate-pulse rounded-2xl bg-subtle" />
        <div className="h-[140px] w-full animate-pulse rounded-2xl bg-subtle" />
      </div>
    );
  }

  const handleEditorSubmit = (draft: HabitDraft) => {
    if (editing === 'new') {
      const habit: Habit = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `h-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: draft.name,
        emoji: draft.emoji,
        color: draft.color,
        createdAt: Date.now()
      };
      void data.addHabit(habit);
    } else if (editing) {
      void data.updateHabit({ ...editing, name: draft.name, emoji: draft.emoji, color: draft.color });
    }
    setEditing(null);
  };

  const handleExport = async () => {
    try {
      const json = await data.exportJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rhythm-export-${today}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExported(true);
      window.setTimeout(() => setExported(false), 2500);
    } catch {
      setExported(false);
    }
  };

  const handleReset = () => {
    void data.clearAll();
    setConfirmReset(false);
  };

  const handleDeleteHabit = (id: string) => {
    void data.removeHabit(id);
    setDeleting(null);
  };

  const editingHabit = editing && editing !== 'new' ? editing : null;

  return (
    <div className="screen-enter flex flex-col gap-4">
      <header style={{ '--i': 0 } as CSSProperties}>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Einstellungen</p>
        <h1 className="mt-1 font-serif text-[34px] font-medium leading-tight tracking-tight">
          Einstellungen
        </h1>
      </header>

      <Card style={{ '--i': 1 } as CSSProperties} className="p-4">
        <SectionLabel>Darstellung</SectionLabel>
        <div
          role="radiogroup"
          aria-label="Erscheinungsbild"
          className="flex gap-1 rounded-xl border border-line bg-subtle p-1"
        >
          {THEME_OPTIONS.map((opt) => {
            const isActive = themePref === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onThemeChange(opt.id)}
                className={`flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                  isActive ? 'bg-accent text-accent-fg shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon name={opt.icon} size={16} strokeWidth={2.3} />
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
          {themePref === 'system'
            ? 'Folgt automatisch der Einstellung deines Geräts.'
            : themePref === 'light'
              ? 'Hell — unabhängig von deinem Gerät.'
              : 'Dunkel — unabhängig von deinem Gerät.'}
        </p>
      </Card>

      <Card style={{ '--i': 2 } as CSSProperties} className="p-4">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Gewohnheiten</SectionLabel>
          <span className="font-mono text-[12px] text-faint">{data.habits.length}</span>
        </div>
        {data.habits.length === 0 ? (
          <p className="mb-3 mt-1 text-[14px] leading-relaxed text-muted">
            Noch keine Gewohnheiten. Erstelle deine erste, um Rhythmus zu finden.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {habitStats.map(({ habit, current, longest }) => (
              <li key={habit.id} className="py-3 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="habit-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[20px]"
                    style={habitChipVars(habit.color) as CSSProperties}
                  >
                    {habit.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">
                      {habit.name}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-muted">
                      {current > 0 ? (
                        <>
                          <span className="font-mono tracking-tight">{current}</span>{' '}
                          {current === 1 ? 'Tag' : 'Tage'} Serie
                        </>
                      ) : (
                        'Noch keine Serie'
                      )}
                      {longest > current && <> · Rekord {longest}</>}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(habit)}
                    aria-label={`${habit.name} bearbeiten`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink"
                  >
                    <Icon name="pencil" size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(deleting === habit.id ? null : habit.id)}
                    aria-label={`${habit.name} löschen`}
                    aria-expanded={deleting === habit.id}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </div>
                {deleting === habit.id && (
                  <div className="fade-in mt-2 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 dark:border-rose-400/25 dark:bg-rose-400/10">
                    <p className="flex-1 text-[12px] font-medium leading-snug text-rose-700 dark:text-rose-300">
                      „{habit.name}“ wirklich löschen? Alle Serien gehen verloren.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="h-9 shrink-0 rounded-lg bg-rose-600 px-3 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Löschen
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(null)}
                      className="h-9 shrink-0 rounded-lg px-3 text-[12px] font-semibold text-muted transition-colors hover:bg-subtle"
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <PrimaryButton onClick={() => setEditing('new')} className="mt-3 w-full">
          <Icon name="plus" size={17} strokeWidth={2.6} />
          Gewohnheit hinzufügen
        </PrimaryButton>
      </Card>

      <Card style={{ '--i': 3 } as CSSProperties} className="p-4">
        <SectionLabel>Datensicherung</SectionLabel>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] leading-relaxed text-muted">
            Alle Daten bleiben lokal auf diesem Gerät.
            <span className="block text-faint">Exportiere eine JSON-Sicherung.</span>
          </p>
          <GhostButton onClick={handleExport} aria-label="Daten exportieren">
            <Icon name="download" size={16} />
            {exported ? 'Gespeichert' : 'Export'}
          </GhostButton>
        </div>
        <div className="mt-3 border-t border-line pt-3">
          {confirmReset ? (
            <div className="flex items-center gap-2.5">
              <p className="flex-1 text-[13px] font-medium text-rose-600 dark:text-rose-300">
                Wirklich alle Daten löschen?
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="h-10 rounded-lg bg-rose-600 px-3.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Löschen
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="h-10 rounded-lg px-3 text-[13px] font-semibold text-muted transition-colors hover:bg-subtle"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-400/25 dark:text-rose-300 dark:hover:bg-rose-400/10"
            >
              <Icon name="trash" size={15} />
              Alle Daten löschen
            </button>
          )}
        </div>
      </Card>

      <Card style={{ '--i': 4 } as CSSProperties} className="p-4">
        <SectionLabel>Über</SectionLabel>
        <h2 className="font-serif text-[20px] font-medium tracking-tight">Rhythm</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Offlinefähig · vollständig lokal in deinem Browser. Kein Konto, keine Cloud, kein
          Tracking — nur du, deine Gewohnheiten und deine Stimmung.
        </p>
        <p className="mt-2 font-mono text-[11px] text-faint">v1.0 · Web-App</p>
      </Card>

      {editing === 'new' && (
        <HabitEditor initial={null} onSubmit={handleEditorSubmit} onClose={() => setEditing(null)} />
      )}
      {editingHabit && (
        <HabitEditor
          initial={{ name: editingHabit.name, emoji: editingHabit.emoji, color: editingHabit.color }}
          onSubmit={handleEditorSubmit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
