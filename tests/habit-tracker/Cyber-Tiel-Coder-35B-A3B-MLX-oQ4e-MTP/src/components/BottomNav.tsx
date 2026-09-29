import type { SVGProps } from 'react'
import type { TabId } from '../types'
import { cn } from '../lib/cn'
import { IconCalendar, IconChart, IconGear } from './icons'

const TABS: Array<{
  id: TabId
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactNode
}> = [
  { id: 'today', label: 'Heute', icon: IconCalendar },
  { id: 'week', label: 'Woche', icon: IconChart },
  { id: 'settings', label: 'Einstellungen', icon: IconGear },
]

export function BottomNav({
  tab,
  onChange,
}: {
  tab: TabId
  onChange: (t: TabId) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20">
      <div className="border-t border-[var(--color-line)] bg-[#171614]/90 px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-[420px] items-center justify-around gap-2">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                aria-label={t.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-1.5 px-4 text-[11px] font-medium tracking-wide transition-colors',
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]',
                )}
              >
                <Icon width={22} height={22} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
