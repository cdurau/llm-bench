import type { ReactNode } from 'react';

interface Props {
  title: string;
  message: string;
  action?: ReactNode;
}

/** Leerer Zustand (z. B. keine Aktivitäten) mit optionalem Aktions-Button. */
export function EmptyState({ title, message, action }: Props) {
  return (
    <section className="card">
      <div className="empty">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 2 2 2h2a2 2 0 0 2-2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
          {title}
        </p>
        <p>{message}</p>
        {action && <div style={{ marginTop: 14 }}>{action}</div>}
      </div>
    </section>
  );
}
