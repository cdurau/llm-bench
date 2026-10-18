import { useState } from "react"
import { useData } from "../hooks/useData"
import { useDarkMode, type Appearance } from "../hooks/useDarkMode"
import { usePWA } from "../hooks/usePWA"
import { IconMoon, IconSettings, IconSun } from "./icons"

const APPEARANCE_OPTIONS: Array<{ id: Appearance; label: string; icon: typeof IconSun }> = [
  { id: "system", label: "System", icon: IconSettings },
  { id: "light", label: "Licht", icon: IconSun },
  { id: "dark", label: "Dunkel", icon: IconMoon },
]

export default function Settings() {
  const { appearance, setAppearance } = useDarkMode()
  const { habits, completions, moods, clearAll } = useData()
  const { prompt, install } = usePWA()
  const [confirming, setConfirming] = useState(false)

  async function handleInstall() {
    const outcome = await install()
    if (outcome === "accepted") setConfirming(false)
  }

  function handleClear() {
    if (window.confirm("Alle Habits, Streaks und Stimmungen löschen?")) {
      clearAll()
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col gap-6" id="panel-settings" role="tabpanel">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Erscheinungsbild & Daten</p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Erscheinungsbild
        </h2>
        <div className="flex flex-col gap-2">
          {APPEARANCE_OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = appearance === id
            return (
              <button
                key={id}
                onClick={() => setAppearance(id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                }`}
                style={{ minHeight: 52 }}
              >
                <Icon className="h-5 w-5" />
                {label}
                {active && <span className="ml-auto text-xs text-[var(--accent)]">Aktiv</span>}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Installation
        </h2>
        <div className="flex flex-col gap-2">
          {prompt ? (
            <button
              onClick={handleInstall}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)]"
              style={{ minHeight: 52 }}
            >
              Auf Heim Bildschirm hinzufügen
            </button>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
              {typeof window !== "undefined" &&
              matchMedia("(display-mode: standalone)").matches
                ? "Die App ist bereits installiert."
                : "Öffne die App in Safari und wähle 'Auf Heim Bildschirm'."}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Daten
        </h2>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-muted)]">
          <div className="flex justify-between py-1">
            <span>Habits</span>
            <span className="font-medium text-[var(--text)]">{habits.length}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Abgehakte Tage</span>
            <span className="font-medium text-[var(--text)]">{completions.length}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Stimmungen</span>
            <span className="font-medium text-[var(--text)]">{moods.length}</span>
          </div>
        </div>
        <button
          onClick={() => setConfirming(true)}
          disabled={habits.length === 0 && moods.length === 0}
          className="mt-2 w-full rounded-2xl border border-[var(--danger)]/40 bg-transparent px-4 py-3 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)] hover:text-[var(--danger-text)] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ minHeight: 52 }}
        >
          Alle Daten löschen
        </button>
      </section>

      <footer className="pt-2 text-center text-xs text-[var(--text-muted)]">
        Rhythm · lokal & offline
      </footer>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 animate-fade"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-[var(--surface)] p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-semibold tracking-tight">Wirklich löschen?</h3>
            <p className="mb-5 text-sm text-[var(--text-muted)]">
              Alle Habits, Streaks und Stimmungen werden unwiderruflich entfernt.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[var(--border-strong)] text-sm font-medium transition-colors hover:bg-[var(--accent-soft)]"
                style={{ minHeight: 44 }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleClear}
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--danger)] px-4 text-sm font-semibold text-[var(--danger-text)] transition-colors"
                style={{ minHeight: 44 }}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
