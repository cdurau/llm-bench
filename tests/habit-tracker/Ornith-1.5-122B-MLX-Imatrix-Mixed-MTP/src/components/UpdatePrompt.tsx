import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Zeigt sanft an, dass eine neue Version der App verfügbar ist.
 * Bei `registerType: 'autoUpdate'` aktualisiert sich die App ohnehin;
 * dieser Hinweis ist optionaler Komfort.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError() {
      // Registrierung fehlgeschlagen — nicht blockierend.
    },
  })

  if (!needRefresh) return null

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-[20px] p-4 shadow-lg"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 8px 24px var(--shadow-soft)',
      }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
        Neue Version verfügbar
      </p>
      <p className="mt-1 mb-3 text-xs" style={{ color: 'var(--muted)' }}>
        Aktualisiere für die neueste Version.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="btn btn-primary flex-1"
        >
          Jetzt
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="btn flex-1"
          style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
        >
          Später
        </button>
      </div>
    </div>
  )
}
