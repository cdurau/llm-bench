import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
}

/** Ruhiger, zentrierter Leerzustand: ein Markenzeichen, ein Satz, eine Einladung. */
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-surface/60 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sunken text-ink-faint">
        {icon}
      </div>
      <h2 className="mt-4 text-[17px] font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-ink-soft">{body}</p>
      {action}
    </div>
  )
}
