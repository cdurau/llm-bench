interface EmptyStateProps {
  title: string
  text: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="reveal card mt-8 flex flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-2)]">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true" style={{ color: 'var(--muted)' }}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div>
        <h3 className="font-serif text-xl text-[var(--text)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
      </div>
      {action && (
        <button
          data-testid="habit-add"
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-md bg-[var(--text)] px-5 py-3 text-sm font-medium text-[var(--bg)] transition-transform active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}