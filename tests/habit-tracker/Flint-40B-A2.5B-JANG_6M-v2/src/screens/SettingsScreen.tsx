import { useState } from 'react';
import { useTheme } from '../lib/theme';
import { useAppData } from '../hooks/useAppData';
import type { ThemeMode } from '../lib/types';

const THEME_OPTIONS: ReadonlyArray<{ id: ThemeMode; label: string }> = [
  { id: 'light', label: 'Hell' },
  { id: 'system', label: 'Auto' },
  { id: 'dark', label: 'Dunkel' },
];

export default function SettingsScreen() {
  const { theme, resolved, setTheme } = useTheme();
  const { clearAll } = useAppData();
  const [confirming, setConfirming] = useState(false);
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;

  const themeLabel = theme === 'system' ? 'Automatisch' : resolved === 'dark' ? 'Dunkel' : 'Hell';

  const handleClearAll = () => {
    clearAll();
    setConfirming(false);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-surface p-5" aria-label="Design">
        <h2 className="font-serif text-xl text-ink">Erscheinung</h2>
        <p className="mt-1 text-sm text-muted">Für dieses Gerät gespeichert.</p>
        <div className="mt-4 flex rounded-lg border border-border p-1" role="group" aria-label="Design wählen">
          {THEME_OPTIONS.map((option) => {
            const active = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={active}
                className={`flex-1 rounded-md py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  active ? 'bg-ink text-canvas' : 'text-muted hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Aktuell: {themeLabel}</p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5" aria-label="Offline">
        <h2 className="font-serif text-xl text-ink">Offline</h2>
        <p className="mt-2 text-sm text-muted">
          Rhythm funktioniert vollständig offline. Alle Daten liegen in deinem Browser und werden nicht auf einem Server
          gesichert.
        </p>
        <p className="mt-2 text-sm text-ink">Status: {online ? 'Online' : 'Offline'}</p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5" aria-label="Daten">
        <h2 className="font-serif text-xl text-ink">Daten</h2>
        <p className="mt-1 text-sm text-muted">
          Alle Habits, Erledigungen und Stimmungen werden dauerhaft aus diesem Browser gelöscht.
        </p>
        {confirming ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="flex-1 rounded-lg bg-ink py-3 text-sm font-medium text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Wirklich löschen
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-lg border border-[#9f2f2d]/40 py-3 text-sm font-medium text-[#9f2f2d] transition-colors hover:bg-[#fdebec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Alle Daten löschen
          </button>
        )}
      </section>
    </div>
  );
}