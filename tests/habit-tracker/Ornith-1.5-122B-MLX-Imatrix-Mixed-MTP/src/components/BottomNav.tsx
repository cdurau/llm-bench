import { HomeIcon, ChartIcon, GearIcon } from './Icons'

export type ViewId = 'today' | 'week' | 'settings'

interface BottomNavProps {
  active: ViewId
  onChange: (id: ViewId) => void
}

const TABS: { id: ViewId; label: string; Icon: typeof HomeIcon }[] = [
  { id: 'today', label: 'Heute', Icon: HomeIcon },
  { id: 'week', label: 'Woche', Icon: ChartIcon },
  { id: 'settings', label: 'Einstellungen', Icon: GearIcon },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className="btn flex-1 flex-col items-center gap-1.5 rounded-none py-3"
              style={{
                minHeight: 56,
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Icon width={22} height={22} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
