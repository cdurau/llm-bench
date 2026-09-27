import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Hält den Service-Worker-Update-Flow im Blick: solange eine neue Version
 * wartet, erscheint unten rechts ein kleiner „Neu laden“-Button.
 */
export function PwaUpdater() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh: () => setNeedsUpdate(true),
    });
    updateRef.current = (reload) => updateSW(reload);
    return () => {
      updateRef.current = null;
    };
  }, []);

  if (!needsUpdate) return null;

  return (
    <div className="update">
      <span className="update__text">Neue Version verfügbar</span>
      <button
        type="button"
        className="btn btn--primary btn--small"
        onClick={() => {
          void updateRef.current?.(true);
        }}
      >
        Neu laden
      </button>
    </div>
  );
}
