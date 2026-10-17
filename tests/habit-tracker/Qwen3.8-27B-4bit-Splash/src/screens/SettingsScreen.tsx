import { useState, type CSSProperties } from 'react'
import { HabitForm } from '../components/HabitForm'
import { IconMoon, IconMonitor, IconPencil, IconPlus, IconSun, IconTrash } from '../components/Icon'
import { Segmented } from '../components/Segmented'
import { Sheet } from '../components/Sheet'
import { habitColorVar } from '../lib/palette'
import type { Habit } from '../lib/db'
import { useApp } from '../state/AppProvider'
import { useTheme } from '../theme/ThemeProvider'

type SettingsForm = { habit: Habit | 'new' } | null

/** Einstellungen: Farbschema, Habit-Verwaltung, Daten, Info. */
export function SettingsScreen() {
  const app = useApp()
  const { mode, setMode } = useTheme()
  const [form, setForm] = useState<SettingsForm>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // Zweistufige Bestätigung: erst tippen, dann „Wirklich?“ – ohne systemeigene Dialoge.
  const startDelete = (id: string) => {
    if (confirmDeleteId === id) {
      void app.deleteHabit(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
      window.setTimeout(() => {
        setConfirmDeleteId((current) => (current === id ? null : current))
      }, 3500)
    }
  }

  const startClear = () => {
    if (confirmClear) {
      void app.clearAllData()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      window.setTimeout(() => setConfirmClear(false), 3500)
    }
  }

  const submit = async (name: string, emoji: string, color: Habit['color']) => {
    if (form?.habit === 'new') {
      await app.addHabit(name, emoji, color)
    } else if (form?.habit) {
      await app.updateHabit(form.habit.id, { name, emoji, color })
    }
    setForm(null)
  }

  return (
    <div>
      <h1 className="font-serif text-[34px] leading-[1.08] tracking-[-0.02em]">Einstellungen</h1>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
          Erscheinung
        </h2>
        <div className="mt-3">
          <Segmented
            label="Farbschema"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'system', label: 'System', icon: <IconMonitor className="h-4 w-4" /> },
              { value: 'light', label: 'Hell', icon: <IconSun className="h-4 w-4" /> },
              { value: 'dark', label: 'Dunkel', icon: <IconMoon className="h-4 w-4" /> },
            ]}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Folgt standardmäßig deiner Systemeinstellung. Die Auswahl bleibt auf diesem Gerät
          gespeichert.
        </p>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Habits
          </h2>
          <button
            type="button"
            onClick={() => setForm({ habit: 'new' })}
            className="flex h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-accent"
          >
            <IconPlus className="h-4 w-4" />
            Anlegen
          </button>
        </div>

        {app.habits.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {app.habits.map((habit, index) => {
              const streaks = app.habitStreaks(habit.id)
              const confirming = confirmDeleteId === habit.id
              return (
                <li
                  key={habit.id}
                  className="reveal flex min-h-[60px] items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5"
                  style={{ '--i': index } as CSSProperties}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${habitColorVar(habit.color)} 14%, transparent)`,
                    }}
                    aria-hidden="true"
                  >
                    {habit.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">{habit.name}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-ink-faint">
                      Serie {streaks.current} · Rekord {streaks.longest}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ habit })}
                    aria-label={`„${habit.name}“ bearbeiten`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft"
                  >
                    <IconPencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startDelete(habit.id)}
                    aria-label={
                      confirming
                        ? 'Löschen bestätigen'
                        : `„${habit.name}“ endgültig löschen`
                    }
                    className={`flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      confirming ? 'bg-danger-soft px-3 text-danger' : 'w-11 text-ink-faint'
                    }`}
                  >
                    <IconTrash className="h-4 w-4" />
                    {confirming && 'Wirklich?'}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 rounded-2xl border border-line bg-surface/60 p-4 text-sm text-ink-soft">
            Noch keine Habits angelegt.
          </p>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Daten</h2>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Habits, Haken und Stimmungen liegen ausschließlich lokal in IndexedDB auf diesem Gerät.
          Kein Account, keine Cloud, keine Synchronisation.
        </p>
        <button
          type="button"
          onClick={startClear}
          className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${
            confirmClear
              ? 'border-danger bg-danger-soft text-danger'
              : 'border-line text-ink-soft'
          }`}
        >
          <IconTrash className="h-4 w-4" />
          {confirmClear ? 'Wirklich alles löschen?' : 'Alle Daten löschen'}
        </button>
      </section>

      <div className="mt-6 flex items-center justify-between px-1 pb-2">
        <p className="text-xs text-ink-faint">Rhythm 1.0</p>
        <p className="text-xs text-ink-faint">lokal · offline · privat</p>
      </div>

      {form && (
        <Sheet
          title={form.habit === 'new' ? 'Neuer Habit' : 'Habit bearbeiten'}
          onClose={() => setForm(null)}
        >
          <HabitForm
            initial={form.habit === 'new' ? null : form.habit}
            onSubmit={(name, emoji, color) => void submit(name, emoji, color)}
          />
        </Sheet>
      )}
    </div>
  )
}
