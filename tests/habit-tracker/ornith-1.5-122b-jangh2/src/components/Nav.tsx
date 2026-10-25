import type { EffectiveTheme, ThemeMode } from '../types'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function WeekIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.12l.07.09a2 2 0 1 1-2.83 2.83l-.09-.07a1.65 1.65 0 0 0-1.94-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.12.33l-.09.07a2 2 0 1 1-2.83-2.83l.07-.09A1.65 1.65 0 0 0 6 15h-.09A1.65 1.65 0 0 0 4.5 14H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6 9a1.65 1.65 0 0 0-.33-1.12l-.07-.09a2 2 0 1 1 2.83-2.83l.09.07A1.65 1.65 0 0 0 9 6h.09A1.65 1.65 0 0 0 10.5 4.5H11a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 6a1.65 1.65 0 0 0 1.12-.33l.09-.07a2 2 0 1 1 2.83 2.83l-.07.09A1.65 1.65 0 0 0 18 9h.09A1.65 1.65 0 0 0 19.5 10.5H20a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 18 15z" />
    </svg>
  )
}

export type Screen = 'today' | 'week' | 'settings'

export default function Nav({ screen, onSet }: { screen: Screen; onSet: (s: Screen) => void }) {
  const items: { testId: string; id: Screen; label: string; icon: JSX.Element }[] = [
    { testId: 'nav-today', id: 'today', label: 'Heute', icon: <CheckIcon /> },
    { testId: 'nav-week', id: 'week', label: 'Woche', icon: <WeekIcon /> },
    { testId: 'nav-settings', id: 'settings', label: 'Einstellungen', icon: <SettingsIcon /> },
  ]

  return (
    <nav className="theme-transition fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="mx-auto flex max-w-3xl">
        {items.map((it) => (
          <button
            key={it.testId}
            data-testid={it.testId}
            type="button"
            onClick={() => onSet(it.id)}
            aria-current={screen === it.id ? 'page' : undefined}
            aria-label={it.label}
            className="theme-transition flex min-h-[44px] flex-1 items-center justify-center gap-2 px-3 py-3 text-sm font-medium"
            style={{ color: screen === it.id ? 'var(--accent-strong)' : 'var(--muted)' }}
          >
            <span className="flex items-center">{it.icon}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}