import { useEffect, useState } from 'react'
import { useData } from './hooks/useData'
import { applyTheme } from './theme'
import { BottomNav, type ViewId } from './components/BottomNav'
import { UpdatePrompt } from './components/UpdatePrompt'
import { TodayView } from './views/TodayView'
import { WeekView } from './views/WeekView'
import { SettingsView } from './views/SettingsView'
import { addHabit, updateHabit, deleteHabit, toggleCompletion, setMood, clearMood, setTheme } from './store'
import { todayKey } from './date'

export function App() {
  const data = useData()
  const [view, setView] = useState<ViewId>('today')

  // Theme beim Laden/Ändern anwenden.
  useEffect(() => {
    if (data) applyTheme(data.settings.theme)
  }, [data])

  if (!data) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3">
        <div
          className="flex size-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
        >
          <span className="font-serif text-2xl" style={{ letterSpacing: '-0.02em' }}>R</span>
        </div>
        <span className="font-serif text-lg" style={{ color: 'var(--muted)' }}>Rhythm</span>
      </div>
    )
  }

  const onToggle = (habitId: string) => toggleCompletion(habitId)

  const onSetMood = (value: number) => {
    const existing = data.moods.find((m) => m.day === todayKey())
    void setMood(todayKey(), value, existing?.note ?? '')
  }

  const onSetNote = (note: string) => {
    const existing = data.moods.find((m) => m.day === todayKey())
    if (existing) void setMood(todayKey(), existing.value, note)
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 pt-6 pb-32">
      {/* App-Bar */}
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 items-center justify-center rounded-xl"
            style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
          >
            <span className="font-serif text-lg" style={{ letterSpacing: '-0.02em' }}>
              R
            </span>
          </span>
          <span className="font-serif text-lg font-semibold" style={{ letterSpacing: '-0.02em' }}>
            Rhythm
          </span>
        </div>
      </header>

      {/* Inhalt */}
      <main className="flex-1">
        {view === 'today' && (
          <TodayView
            data={data}
            onToggle={onToggle}
            onSetMood={onSetMood}
            onSetNote={onSetNote}
            onClearMood={() => clearMood(todayKey())}
          />
        )}
        {view === 'week' && <WeekView data={data} />}
        {view === 'settings' && (
          <SettingsView
            data={data}
            onSetTheme={(mode) => void setTheme(mode)}
            onAddHabit={(input) => void addHabit(input)}
            onUpdateHabit={(id, patch) => void updateHabit(id, patch)}
            onDeleteHabit={(id) => void deleteHabit(id)}
          />
        )}
      </main>

      <BottomNav active={view} onChange={setView} />
      <UpdatePrompt />
    </div>
  )
}
