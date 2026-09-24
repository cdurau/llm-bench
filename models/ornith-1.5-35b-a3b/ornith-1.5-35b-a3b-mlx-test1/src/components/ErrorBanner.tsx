interface Props {
  message: string;
  onRetry: () => void;
}

/** Zeigt einen nicht-kritischen Fehler mit Wiederholungs-Button an. */
export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="error-banner" role="alert">
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, fill: 'currentColor', flex: '0 0 auto' }}>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-13a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1Z" fill="currentColor" />
      </svg>
      <span>{message}</span>
      <button type="button" className="btn btn-ghost" onClick={onRetry}>
        Erneut versuchen
      </button>
    </div>
  );
}
