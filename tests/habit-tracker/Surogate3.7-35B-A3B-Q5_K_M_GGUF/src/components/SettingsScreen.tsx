// --- Screen: Einstellungen (Dark Mode, Daten, Über) ---

import { useEffect, useState } from 'react';
import * as db from '../db';
import type { DarkModePreference } from '../types';
import { IconCog, IconTrash } from './Icons';

interface Props {
  preference: DarkModePreference;
  setPreference: (p: DarkModePreference) => void;
  habitCount: number;
  onClearAll: () => void;
}

export function SettingsScreen({ preference, setPreference, habitCount, onClearAll }: Props) {
  const [moodCount, setMoodCount] = useState<number | null>(null);

  useEffect(() => {
    db.getAllMoods().then((moods) => setMoodCount(moods.length)).catch(() => setMoodCount(null));
  }, []);

  const options: { value: DarkModePreference; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'dark', label: 'Dunkel' },
    { value: 'light', label: 'Hell' },
  ];

  return (
    <div className="px-5 pt-6 pb-28 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-faint font-semibold mb-1">Einstellungen</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Einstellungen</h1>
      </div>

      {/* Anzeige */}
      <section className="bg-surface rounded-lg border border-border shadow-card animate-fade-in">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-ink mb-1">Anzeige</h2>
          <p className="text-xs text-ink-muted">Rhythm passt sich der Uhrzeit an oder du stellst den Dunkelmodus manuell ein.</p>
        </div>
        <div className="px-4 pb-4">
          <div className="flex gap-2" role="radiogroup" aria-label="Dunkelmodus">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={preference === o.value}
                onClick={() => setPreference(o.value)}
                className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors ${
                  preference === o.value
                    ? 'bg-accent text-white'
                    : 'bg-surface-alt text-ink hover:bg-surface-alt'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Daten */}
      <section className="bg-surface rounded-lg border border-border shadow-card animate-fade-in">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-ink mb-1">Daten</h2>
          <p className="text-xs text-ink-muted">Alle Daten liegen nur lokal auf diesem Gerät.</p>
        </div>
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-soft text-accent-text">
                <IconCog className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Habits</p>
                <p className="text-xs text-ink-muted">{habitCount} angelegt</p>
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums text-ink-muted">{habitCount}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-pale-yellow text-pale-yellow-text text-lg">
                😐
              </span>
              <div>
                <p className="text-sm font-medium text-ink">Stimmungen</p>
                <p className="text-xs text-ink-muted">{moodCount ?? '…'} Einträge</p>
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums text-ink-muted">{moodCount ?? '—'}</span>
          </div>
          <button
            type="button"
            onClick={onClearAll}
            className="w-full flex items-center gap-3 py-3 text-left text-[#9F2F2D] hover:bg-surface-alt rounded-lg px-2 transition-colors"
          >
            <IconTrash className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Alle Daten löschen</p>
              <p className="text-xs text-ink-muted">Habits, Tagebücher und Stimmungen zurücksetzen</p>
            </div>
          </button>
        </div>
      </section>

      {/* Über */}
      <section className="bg-surface rounded-lg border border-border shadow-card animate-fade-in px-4 py-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl font-bold tracking-tight text-ink">Rhythm</span>
          <span className="text-xs font-semibold text-ink-faint bg-surface-alt px-2 py-0.5 rounded-full">1.0</span>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed mb-2">
          Ein ruhiger Habit- und Stimmungs-Tracker für deinen Alltag. Alles passiert lokal und offline.
        </p>
        <p className="text-xs text-ink-faint">
          Zur Installation: „Teilen" → „Zum Home-Bildschirm hinzufügen".
        </p>
      </section>
    </div>
  );
}
