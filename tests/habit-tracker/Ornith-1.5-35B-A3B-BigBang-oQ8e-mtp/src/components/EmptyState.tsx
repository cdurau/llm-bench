import type { ReactNode } from "react"
import { IconLeaf } from "./icons"

export default function EmptyState({
  title,
  description,
  action,
  icon = <IconLeaf className="h-10 w-10" />,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-[var(--text-muted)]">{icon}</div>
      <h3 className="mb-1 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>
      {action}
    </div>
  )
}
