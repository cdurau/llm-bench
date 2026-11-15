import { useEffect, useState } from 'react'
import ActiveSession from './components/ActiveSession'
import Home from './components/Home'
import StartForm, { type WheelStartFields } from './components/StartForm'
import ThemeToggle from './components/ThemeToggle'
import WheelDetail from './components/WheelDetail'
import { loadDraft, loadWheels, newId, saveDraft, saveWheels } from './storage'
import { useTheme } from './useTheme'
import { SEGMENT_COUNT } from './types'
import type { FocusWheel, WheelDraft } from './types'

type View = 'home' | 'new' | 'session' | 'detail'

const TITLES: Record<View, string> = {
  home: 'Fokusrad',
  new: 'Neues Fokusrad',
  session: 'Fokusrad-Session',
  detail: 'Archiv-Eintrag',
}

export default function App() {
  const { mode, setMode } = useTheme()
  const [wheels, setWheels] = useState<FocusWheel[]>(() => loadWheels())
  const [draft, setDraft] = useState<WheelDraft | null>(() => loadDraft())
  // Der abgeschlossene Entwurf bleibt sichtbar, bis die Shift-Ansicht verlassen wird.
  const [finishedDraft, setFinishedDraft] = useState<WheelDraft | null>(null)
  const [view, setView] = useState<View>('home')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => saveWheels(wheels), [wheels])
  useEffect(() => saveDraft(draft), [draft])

  const goHome = () => {
    setView('home')
    setSelectedId(null)
  }

  const startDraft = (fields: WheelStartFields) => {
    const next: WheelDraft = {
      id: newId(),
      createdAt: new Date().toISOString(),
      initialThought: fields.initialThought,
      targetThought: fields.targetThought,
      startMood: fields.startMood,
      thoughts: Array.from({ length: SEGMENT_COUNT }, () => ''),
    }
    setDraft(next)
    setView('session')
  }

  const finishWheel = (wheel: FocusWheel) => {
    setWheels((prev) => [wheel, ...prev])
    setFinishedDraft(draft)
    setDraft(null) // Rad ist im Archiv persistiert – der Entwurf verschwindet
  }

  const discardDraft = () => {
    setDraft(null)
    setFinishedDraft(null)
    goHome()
  }

  const seeArchive = () => {
    setFinishedDraft(null)
    goHome()
  }

  const deleteWheel = () => {
    setWheels((prev) => prev.filter((w) => w.id !== selectedId))
    goHome()
  }

  const sessionDraft = draft ?? finishedDraft
  const selectedWheel = wheels.find((w) => w.id === selectedId) ?? null

  const renderView = () => {
    if (view === 'new') return <StartForm onStart={startDraft} onCancel={goHome} />
    if (view === 'session' && sessionDraft)
      return (
        <ActiveSession
          key={sessionDraft.id}
          draft={sessionDraft}
          onUpdate={setDraft}
          onFinish={finishWheel}
          onDiscard={discardDraft}
          onSeeArchive={seeArchive}
        />
      )
    if (view === 'detail' && selectedWheel)
      return <WheelDetail wheel={selectedWheel} onDelete={deleteWheel} />
    return (
      <Home
        wheels={wheels}
        draft={draft}
        onStart={() => setView('new')}
        onResume={() => setView('session')}
        onOpen={(id) => {
          setSelectedId(id)
          setView('detail')
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh">
      <header className="safe-top sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2">
          <div className="flex min-w-0 items-center gap-1">
            {view !== 'home' && (
              <button
                type="button"
                onClick={goHome}
                aria-label="Zurück zur Übersicht"
                className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 hover:text-ink hover:bg-surface-2 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <h1 className="truncate text-[17px] font-semibold tracking-tight text-ink">
              {TITLES[view]}
            </h1>
          </div>
          <ThemeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4">{renderView()}</main>
    </div>
  )
}
