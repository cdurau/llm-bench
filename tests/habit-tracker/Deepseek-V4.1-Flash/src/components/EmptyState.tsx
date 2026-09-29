import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card animate-rise flex flex-col items-center px-8 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-elevated text-accent">
        {icon}
      </span>
      <h3 className="display mt-5 text-xl text-ink">{title}</h3>
      <p className="mt-2 max-w-[26ch] text-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
