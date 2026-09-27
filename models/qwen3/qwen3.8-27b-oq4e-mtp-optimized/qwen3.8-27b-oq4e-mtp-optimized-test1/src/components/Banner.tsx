import type { ReactNode } from 'react';

export type BannerTone = 'warning' | 'danger';

/** Leichtes Hinweismeldungsbanner (z. B. nicht lesbare gespeicherte Daten). */
export function Banner({
  tone,
  children,
  onDismiss,
}: {
  tone: BannerTone;
  children: ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div className={`banner banner--${tone}`} role="status">
      <div className="banner__text">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="banner__dismiss"
          onClick={onDismiss}
          aria-label="Hinweis ausblenden"
        >
          ✕
        </button>
      )}
    </div>
  );
}
