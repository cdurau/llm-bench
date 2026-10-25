import { useStore } from '../store'

const MOODS = [
  { value: 1, emoji: '😞', label: 'Sehr schlecht' },
  { value: 2, emoji: '😟', label: 'Schlecht' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Gut' },
  { value: 5, emoji: '😄', label: 'Sehr gut' },
]

export default function Settings() {
  const { settings, setTheme, effectiveTheme, today, moods, setMood } = useStore()
  const mood = moods[today]?.value ?? 0
  const note = moods[today]?.note ?? ''

  const toggleTheme = () => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
  const pickMood = (value: number) => setMood(today, value, note)
  const changeNote = (value: string) => {
    if (mood > 0) setMood(today, mood, value)
  }

  return (
    <section className="pb-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text)]">
          Einstellungen
        </h1>
      </header>

      <div className="card mt-8 p-5">
        <h2 className="font-serif text-lg text-[var(--text)]">Design</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {settings.theme === 'system'
            ? 'Automatisch – folgt dem System.'
            : effectiveTheme === 'dark'
              ? 'Dunkler Modus.'
              : 'Hellener Modus.'}
        </p>
        <button
          data-testid="theme-toggle"
          type="button"
          aria-pressed={effectiveTheme === 'dark'}
          aria-label={effectiveTheme === 'dark' ? 'Dunkler Modus aktiv' : 'Hellener Modus aktiv'}
          onClick={toggleTheme}
          className="theme-transition mt-4 flex h-12 w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)]"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true">{effectiveTheme === 'dark' ? '🌙' : '☀️'}</span>
            {effectiveTheme === 'dark' ? 'Dunkler Modus' : 'Hellener Modus'}
          </span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              effectiveTheme === 'dark' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`theme-transition absolute top-0.5 h-5 w-5 rounded-full bg-[var(--surface)] shadow transition-transform ${
                effectiveTheme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-serif text-lg text-[var(--text)]">Stimmung heute</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Wie geht es dir heute?</p>
        <div className="mt-4 flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              data-testid={`mood-${m.value}`}
              type="button"
              aria-pressed={mood === m.value}
              aria-label={m.label}
              onClick={() => pickMood(m.value)}
              className={`theme-transition flex flex-col items-center gap-1 rounded-xl border py-3 transition-colors ${
                mood === m.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              }`}
              style={{ minWidth: 56 }}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className="text-xs font-medium text-[var(--muted)]">{m.value}</span>
            </button>
          ))}
        </div>
        <input
          data-testid="mood-note"
          value={note}
          onChange={(e) => changeNote(e.target.value)}
          placeholder="Kurznotiz (optional)"
          className="mt-4 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-sm text-[var(--text)] focus-visible"
          aria-label="Kurznotiz zur Stimmung"
        />
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-serif text-lg text-[var(--text)]">Offline &amp; Daten</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Rhythm funktioniert komplett offline. Deine Habits, Erledigungen und Stimmungen
          bleiben lokal auf diesem Gerät gespeichert.
        </p>
      </div>
    </section>
  )
}