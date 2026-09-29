export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-4 pt-16 text-center">
      <p className="w-11 h-11 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-faint)] flex items-center justify-center mb-5">
        <span className="text-lg">·</span>
      </p>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--color-ink-muted)]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
