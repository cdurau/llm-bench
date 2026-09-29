import type { DataLayer } from '../hooks/useData'
import type { ThemeController } from '../hooks/useTheme'
import { themeLabels, themeIcons } from './theme-options'
import { EmptyState } from './EmptyState'
import { IconCheck, IconFlask } from './icons'

export function Settings({
  data,
  theme,
}: {
  data: DataLayer
  theme: ThemeController
}) {
  const total = data.completions.length
  const withMood = data.moods.length

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-ink-muted)]">
          Design
        </h2>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] divide-y divide-[var(--color-line)]">
          {(['system', 'light', 'dark'] as const).map((value) => {
            const active = theme.preference === value
            return (
              <button
                key={value}
                onClick={() => theme.setTheme(value)}
                aria-pressed={active}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-[var(--color-ink-muted)]">
                  {themeIcons[value]({ width: 20, height: 20 })}
                </span>
                <span className="flex-1 text-base font-medium tracking-tight">
                  {themeLabels[value]}
                </span>
                <span
                  className={
                    'relative h-4.5 w-4.5 rounded-full border-2 transition-colors ' +
                    (active
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                      : 'border-[var(--color-line)]')
                  }
                >
                  {active && (
                    <IconCheck
                      width={13}
                      height={13}
                      className="text-white absolute inset-0 m-auto"
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-ink-muted)]">
          Deine Daten
        </h2>
        {data.habits.length === 0 ? (
          <EmptyState
            title="Noch keine Habits"
            description="Lege Habits an, damit hier Statistiken erscheinen."
          />
        ) : (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5 space-y-2.5">
            <DataRow label="Habits" value={`${data.habits.length}`} />
            <DataRow label="Erledigungen gesamt" value={`${total}`} />
            <DataRow label="Tage mit Stimmung" value={`${withMood}`} />
            <DataRow label="Speicherung" value="Lokal (Offline)" />
          </div>
        )}
      </section>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
        <IconFlask width={14} height={14} />
        Rhythm · offlinefähig
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <span className="font-medium tracking-tight">{value}</span>
    </div>
  )
}
