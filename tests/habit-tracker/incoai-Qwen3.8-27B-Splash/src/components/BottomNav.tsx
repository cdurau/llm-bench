import { CalendarCheck, ChartLineUp, Gear } from '@phosphor-icons/react'

export type TabId = 'heute' | 'woche' | 'einstellungen'

const TABS = [
  { id: 'heute' as const, label: 'Heute', Icon: CalendarCheck },
  { id: 'woche' as const, label: 'Woche', Icon: ChartLineUp },
  { id: 'einstellungen' as const, label: 'Einstellungen', Icon: Gear },
]

interface BottomNavProps {
  tab: TabId
  onChange: (tab: TabId) => void
}

/** Bottom-Navigation mit 3 Tabs – mindestens 44 px Touch-Ziel. */
export function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40" aria-label="Hauptnavigation">
      <div className="mx-auto max-w-md px-5">
        <div
          className="flex items-stretch justify-around border-t border-line bg-surface/95 backdrop-blur-sm"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={
                  'flex min-h-14 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors duration-200 ' +
                  (active ? 'text-ink' : 'text-faint hover:text-muted')
                }
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="text-[11px] font-medium tracking-[0.02em]">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
