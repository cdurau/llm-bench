import { Suspense, lazy, useCallback, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { useRhythmData } from './hooks/useRhythmData'
import {
  toggleCompletion,
  addHabit,
  updateHabit,
  deleteHabit,
  setMood,
  clearMood
} from './db'
import { todayStr } from './lib/dates'
import type { Habit } from './types'
import type { HabitColorKey } from './lib/colors'
import BottomNav, { type TabId } from './components/BottomNav'
import TodayScreen from './components/TodayScreen'
import SettingsScreen from './components/SettingsScreen'
import HabitSheet from './components/HabitSheet'

const WeekScreen = lazy(() => import('./components/WeekScreen'))

interface SheetState {
  open: boolean
  initial: Habit | null
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export default function App() {
  const { mode, resolved, setMode } = useTheme()
  const data = useRhythmData()
  const [tab, setTab] = useState<TabId>('today')
  const [sheet, setSheet] = useState<SheetState>({ open: false, initial: null })


  const openAddSheet = useCallback(() => setSheet({ open: true, initial: null }), [])
  const openEditSheet = useCallback((h: Habit) => setSheet({ open: true, initial: h }), [])
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, open: false })), [])

  const handleToggleHabit = useCallback(async (id: string) => {
    try {
      await toggleCompletion(id, todayStr())
      await data.reload()
    } catch (err) {
      console.error('Habit toggle failed', err)
    }
  }, [data])

  const handleSaveHabit = useCallback(async ({ name, emoji, color }: { name: string; emoji: string; color: HabitColorKey }) => {
    try {
      if (sheet.initial) {
        await updateHabit({ ...sheet.initial, name, emoji, color })
      } else {
        await addHabit({ id: newId(), name, emoji, color, createdAt: new Date().toISOString() })
      }
      await data.reload()
      closeSheet()
    } catch (err) {
      console.error('Habit save failed', err)
    }
  }, [sheet.initial, data, closeSheet])

  const handleDeleteHabit = useCallback(async (id: string) => {
    try {
      await deleteHabit(id)
      await data.reload()
    } catch (err) {
      console.error('Habit delete failed', err)
    }
  }, [data])

  const handleSelectMood = useCallback(async (value: 1 | 2 | 3 | 4 | 5) => {
    const t = todayStr()
    const existing = data.moods.get(t)
    try {
      if (existing && existing.mood === value) {
        await clearMood(t)
      } else {
        await setMood(t, value, existing?.note)
      }
      await data.reload()
    } catch (err) {
      console.error('Mood select failed', err)
    }
  }, [data])

  const handleSaveNote = useCallback(async (note: string) => {
    const t = todayStr()
    const existing = data.moods.get(t)
    if (!existing) return
    try {
      await setMood(t, existing.mood, note)
      await data.reload()
    } catch (err) {
      console.error('Note save failed', err)
    }
  }, [data])

  const handleClearMood = useCallback(async () => {
    const t = todayStr()
    try {
      await clearMood(t)
      await data.reload()
    } catch (err) {
      console.error('Mood clear failed', err)
    }
  }, [data])

  return (
    <div className="app-shell min-h-dvh">
      <main className="pb-32" key={tab}>
        {tab === 'today' && (
          <TodayScreen
            data={data}
            resolvedTheme={resolved}
            onToggleHabit={handleToggleHabit}
            onAddHabit={openAddSheet}
            onSelectMood={handleSelectMood}
            onSaveNote={handleSaveNote}
            onClearMood={handleClearMood}
          />
        )}
        {tab === 'week' && (
          <Suspense
            fallback={
              <div className="px-5 pt-7 pb-6">
                <div className="h-9 w-48 rounded-lg bg-[#EAEAEA] dark:bg-[#262522] animate-pulse" />
                <div className="mt-6 h-[220px] card animate-pulse" />
              </div>
            }
          >
            <WeekScreen data={data} resolvedTheme={resolved} onAddHabit={openAddSheet} />
          </Suspense>
        )}
        {tab === 'settings' && (
          <SettingsScreen
            data={data}
            mode={mode}
            resolvedTheme={resolved}
            onSetMode={setMode}
            onAddHabit={openAddSheet}
            onEditHabit={openEditSheet}
            onDeleteHabit={handleDeleteHabit}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <HabitSheet
        open={sheet.open}
        initial={sheet.initial}
        resolvedTheme={resolved}
        onClose={closeSheet}
        onSave={handleSaveHabit}
      />
    </div>
  )
}
