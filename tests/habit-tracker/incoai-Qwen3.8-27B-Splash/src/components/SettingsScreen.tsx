import { useState, type CSSProperties, type ReactNode } from 'react'
import { useRhythm } from '../store'
import { useTheme, type ThemePreference } from '../lib/theme'

const THEME_OPTIONS: Array<{ id: ThemePreference; label: string }> = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
]

function Section({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <section
      className="rise rounded-card border border-line bg-surface p-5 shadow-soft"
      style={{ '--index': index } as CSSProperties}
    >
      <h2 className="px-1 text-xs font-semibold tracking-[0.12em] text-muted uppercase">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function SettingsScreen() {
  const { preference, setTheme } = useTheme()
  const { habits, completions, moods, clearAll } = useRhythm()
  const [confirmClear, setConfirmClear] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    setBusy(true)
    await clearAll()
    setConfirmClear(false)
    setBusy(false)
  }

  return (
    <div className="space-y-6">
      <header className="rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          Einstellungen
        </p>
        <h1 className="mt-2 font-serif text-[30px] leading-tight font-semibold tracking-[-0.02em] text-ink">
          Rhythm
        </h1>
      </header>

      <Section title="Erscheinungsbild" index={1}>
        <div
          className="flex rounded-[10px] border border-line bg-canvas p-1"
          role="radiogroup"
          aria-label="Farbschema"
        >
          {THEME_OPTIONS.map((option) => {
            const active = preference === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.id)}
                className={
                  'min-h-9 flex-1 rounded-[8px] text-[13px] font-medium transition-colors ' +
                  (active ? 'bg-ink text-canvas' : 'text-muted hover:text-ink')
                }
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <p className="mt-3 px-1 text-[13px] leading-relaxed text-faint">
          „System“ folgt der Systemeinstellung deines Geräts. Deine Wahl wird lokal gespeichert.
        </p>
      </Section>

      <Section title="Daten" index={2}>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Gewohnheiten</dt>
            <dd className="font-mono text-[12px] text-ink">{habits.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Abhaken-Einträge</dt>
            <dd className="font-mono text-[12px] text-ink">{completions.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Stimmungstage</dt>
            <dd className="font-mono text-[12px] text-ink">{moods.length}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-line pt-4 text-[13px] leading-relaxed text-faint">
          Alles liegt in IndexedDB direkt auf diesem Gerät. Es gibt kein Konto, keinen Server und
          keine Synchronisation.
        </p>
        <button
          type="button"
          onClick={() => void handleClear()}
          disabled={busy || (habits.length === 0 && completions.length === 0)}
          className="mt-4 min-h-11 w-full rounded-[6px] border border-danger/40 bg-danger-soft text-sm font-medium text-danger transition-[transform,opacity] active:scale-[0.98] disabled:opacity-40"
        >
          {confirmClear ? 'Wirklich alle Daten löschen?' : 'Alle Daten löschen'}
        </button>
      </Section>

      <Section title="Über" index={3}>
        <div className="space-y-2.5 text-[13px] leading-relaxed text-muted">
          <p>
            <span className="font-medium text-ink">Rhythm</span> · Version 1.0
          </p>
          <p>
            Ein ruhiger Tracker für Gewohnheiten und Stimmung – offlinefähig, installierbar und
            ohne Tracking.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            PWA · React · IndexedDB
          </p>
        </div>
      </Section>
    </div>
  )
}
