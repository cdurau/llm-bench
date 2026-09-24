interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

/** Großes, sinnvolles Empty-State-Element. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <section
      className="empty-state"
      role="region"
      aria-label="Keine Einträge"
    >
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </section>
  )
}
