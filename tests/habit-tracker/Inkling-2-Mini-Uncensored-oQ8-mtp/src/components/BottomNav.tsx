import { House, ChartBar, Gear } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export type TabId = 'today' | 'week' | 'settings'

const TABS: { id: TabId; label: string; icon: (props: { size: number; weight?: 'bold' | 'fill' | 'regular' }) => ReactNode }[] = [
  { id: 'today', label: 'Heute', icon: (p) => <House {...p} /> },
  { id: 'week', label: 'Woche', icon: (p) => <ChartBar {...p} /> },
  { id: 'settings', label: 'Einstellungen', icon: (p) => <Gear {...p} /> }
]

export default function BottomNav({
  active,
  onChange
}: {
  active: TabId
  onChange: (t: TabId) => void
}) {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 border-t border-[#8E8A84] dark:border-[#78736C] bg-[#FBFAF8]/90 dark:bg-[#171614]/90 backdrop-blur-md"
    >
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-h-[64px] px-2 pt-2 pb-3 transition-colors ${
                isActive
                  ? 'text-[#A8431F] dark:text-[#E8A87C]'
                  : 'text-[#6B6862] dark:text-[#A39E94] hover:text-[#2F3437] dark:hover:text-[#EDEAE4]'
              }`}
            >
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[11px] font-semibold tracking-tight">{tab.label}</span>
              <span
                aria-hidden="true"
                className={`h-1 w-1 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-[#A8431F] dark:bg-[#E8A87C] opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
