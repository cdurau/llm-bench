import type { ReactElement } from 'react'
import { cn } from '../lib/cn'
import type { TabId } from '../types'
import { ChartIcon, SlidersIcon, SunIcon, type IconProps } from './icons'

interface Tab {
  id: TabId
  label: string
  Icon: (props: IconProps) => ReactElement
}

const TABS: Tab[] = [
  { id: 'today', label: 'Heute', Icon: SunIcon },
  { id: 'week', label: 'Woche', Icon: ChartIcon },
  { id: 'settings', label: 'Einstellungen', Icon: SlidersIcon },
]

interface BottomNavProps {
  tab: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ tab, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 pointer-events-none"
    >
      <div className="mx-auto w-full max-w-[440px] px-5 pb-3">
        <div className="pointer-events-auto flex items-stretch gap-1 rounded-[22px] border border-line bg-surface/85 p-1 shadow-[var(--shadow-float)] backdrop-blur-md">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'press flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.6875rem] font-medium',
                  active
                    ? 'bg-accent-soft text-accent-strong'
                    : 'text-muted hover:text-ink',
                )}
              >
                <Icon size={19} />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}