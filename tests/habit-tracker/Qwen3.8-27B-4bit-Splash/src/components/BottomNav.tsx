import type { ComponentType } from 'react'
import { IconSettings, IconToday, IconWeek } from './Icon'

export type Tab = 'heute' | 'woche' | 'einstellungen'

const TABS: { id: Tab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'heute', label: 'Heute', icon: IconToday },
  { id: 'woche', label: 'Woche', icon: IconWeek },
  { id: 'einstellungen', label: 'Einstellungen', icon: IconSettings },
]

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm"
    >
      <div className="mx-auto grid w-full max-w-[440px] grid-cols-3 px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium tracking-wide transition-colors ${
                active ? 'text-ink' : 'text-ink-faint'
              }`}
            >
              <Icon className="h-[22px] w-[22px]" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
