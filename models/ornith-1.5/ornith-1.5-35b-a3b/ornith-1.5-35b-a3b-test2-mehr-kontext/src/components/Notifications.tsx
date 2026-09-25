import { useNotifications } from '../hooks/useNotifications'

/** Zeigt kurzlebige Feedback-Meldungen (Toast) an. */
export function Notifications() {
  const { notifications, dismiss } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="toasts" role="status" aria-live="polite">
      {notifications.map((n) => (
        <button
          key={n.id}
          type="button"
          className={`toast toast--${n.type}`}
          onClick={() => dismiss(n.id)}
          aria-label="Meldung schließen"
        >
          <span className="toast__message">{n.message}</span>
          <span className="toast__close" aria-hidden="true">
            ×
          </span>
        </button>
      ))}
    </div>
  )
}
