import { useCallback, useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { AppState, FocusWheel, ThemePreference } from './types'
import { clampMood, createDraft } from './types'
import { loadState, saveState } from './storage'
import { applyTheme, resolveTheme, useSystemTheme } from './theme'
import { ThemeToggle } from './components/ThemeToggle'
import { BottomNav, type MainTab } from './components/BottomNav'
import { WheelGlyph } from './components/WheelGlyph'
import { HomeView } from './views/HomeView'
import { SessionView } from './views/SessionView'
import { CompleteView } from './views/CompleteView'
import { ArchiveView } from './views/ArchiveView'
import { DetailView } from './views/DetailView'

type View =
  | { name: 'home' }
  | { name: 'active' }
  | { name: 'complete'; wheelId: string }
  | { name: 'archive' }
  | { name: 'detail'; wheelId: string }

/**
 * Fokusrad – App-Rumpf: hält den App-Zustand (versioniert in
 * `localStorage`), die Themenauswahl und die Ansichtsführung.
 */
export default function App(): ReactElement {
  const [state, setState] = useState<AppState>(() => loadState())
  const [view, setView] = useState<View>({ name: 'home' })

  // Persistenz: jeder Zustandswunsch wird (still) gespeichert.
  useEffect(() => {
    saveState(state)
  }, [state])

  // Theme: Wunsch aus dem Zustand + System-Einstellung.
  const systemTheme = useSystemTheme()
  const resolved = resolveTheme(state.theme, systemTheme)
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setThemePreference = useCallback((theme: ThemePreference) => {
    setState((current) => ({ ...current, theme }))
  }, [])

  /* ---------------- Session-Lebenszyklus ---------------- */

  const startWheel = useCallback(
    (startThought: string, targetThought: string, startMood: number) => {
      setState((current) => ({
        ...current,
        draft: createDraft(startThought, targetThought, startMood)
      }))
      setView({ name: 'active' })
    },
    []
  )

  const saveSegment = useCallback((index: number, text: string) => {
    setState((current) => {
      if (current.draft === null) return current
      const segments = [...current.draft.segments]
      segments[index] = text
      return { ...current, draft: { ...current.draft, segments } }
    })
  }, [])

  /** Schließt das Rad mit der gewählten End-Stimmung ab. */
  const commitWheel = useCallback((endMood: number) => {
    setState((current) => {
      if (current.draft === null) return current
      const completed: FocusWheel = {
        ...current.draft,
        endMood: clampMood(endMood),
        completedAt: new Date().toISOString()
      }
      return {
        ...current,
        draft: null,
        wheels: [completed, ...current.wheels]
      }
    })
  }, [])

  const discardDraft = useCallback(() => {
    setState((current) => ({ ...current, draft: null }))
    setView({ name: 'home' })
  }, [])

  const deleteWheel = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      wheels: current.wheels.filter((wheel) => wheel.id !== id)
    }))
    setView({ name: 'archive' })
  }, [])

  /* ---------------- Abgeleitete Daten ---------------- */

  const draft = state.draft

  /** Das Rad der Abschluss-Ansicht – Entwurf (Abschluss-Phase) oder Verlaufeintrag. */
  const completeWheel =
    view.name === 'complete'
      ? (state.wheels.find((wheel) => wheel.id === view.wheelId) ??
        (state.draft !== null && state.draft.id === view.wheelId ? state.draft : null))
      : null

  const detailWheel =
    view.name === 'detail'
      ? state.wheels.find((wheel) => wheel.id === view.wheelId) ?? null
      : null

  const navVisible = view.name === 'home' || view.name === 'archive' || view.name === 'detail'

  const headerVisible = view.name !== 'active'

  /* ---------------- Ansichtsaufbau ---------------- */

  let viewContent: ReactElement
  switch (view.name) {
    case 'home':
      viewContent = (
        <HomeView
          draft={draft}
          wheels={state.wheels}
          onStart={startWheel}
          onContinue={() => setView({ name: 'active' })}
          onDiscardDraft={discardDraft}
          onOpenArchive={() => setView({ name: 'archive' })}
        />
      )
      break
    case 'active':
      viewContent =
        draft !== null ? (
          <SessionView
            draft={draft}
            onSaveSegment={saveSegment}
            onComplete={() => setView({ name: 'complete', wheelId: draft.id })}
            onBack={() => setView({ name: 'home' })}
            onDiscard={discardDraft}
          />
        ) : (
          <HomeView
            draft={null}
            wheels={state.wheels}
            onStart={startWheel}
            onContinue={() => undefined}
            onDiscardDraft={discardDraft}
            onOpenArchive={() => setView({ name: 'archive' })}
          />
        )
      break
    case 'complete':
      viewContent =
        completeWheel !== null ? (
          <CompleteView
            wheel={completeWheel}
            onCommit={commitWheel}
            onGoToArchive={() => setView({ name: 'archive' })}
            onNewWheel={() => setView({ name: 'home' })}
          />
        ) : (
          <ArchiveView
            wheels={state.wheels}
            onOpenWheel={(id) => setView({ name: 'detail', wheelId: id })}
            onStartNew={() => setView({ name: 'home' })}
          />
        )
      break
    case 'archive':
      viewContent = (
        <ArchiveView
          wheels={state.wheels}
          onOpenWheel={(id) => setView({ name: 'detail', wheelId: id })}
          onStartNew={() => setView({ name: 'home' })}
        />
      )
      break
    case 'detail':
      viewContent =
        detailWheel !== null ? (
          <DetailView
            wheel={detailWheel}
            onDelete={deleteWheel}
          />
        ) : (
          <ArchiveView
            wheels={state.wheels}
            onOpenWheel={(id) => setView({ name: 'detail', wheelId: id })}
            onStartNew={() => setView({ name: 'home' })}
          />
        )
      break
  }

  /** Ziel des Zurück-Buttons im Kopfbereich. */
  const backTarget: View | null =
    view.name === 'detail'
      ? { name: 'archive' }
      : view.name === 'complete'
        ? completeWheel?.endMood === null
          ? { name: 'active' } // noch in der Abschluss-Phase → zurück in die Session
          : { name: 'archive' }
        : null

  return (
    <div className="app-shell mx-auto flex w-full max-w-md flex-col" style={{ minHeight: '100dvh' }}>
      {headerVisible && (
        <header
          className="safe-top sticky top-0 z-30"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid color-mix(in srgb, var(--line) 60%, transparent)'
          }}
        >
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {backTarget !== null ? (
                <button
                  type="button"
                  onClick={() => setView(backTarget)}
                  aria-label="Zurück"
                  className="press chip flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--line)',
                    color: 'var(--ink)'
                  }}
                >
                  <ArrowLeft size={20} aria-hidden />
                </button>
              ) : (
                <WheelGlyph size={26} className="shrink-0" />
              )}
              <span className="truncate text-[17px] font-bold" style={{ color: 'var(--ink)' }}>
                Fokusrad
              </span>
            </div>
            <ThemeToggle value={state.theme} onChange={setThemePreference} />
          </div>
        </header>
      )}

      <main
        className={`flex-1 px-4 pt-3 ${navVisible ? 'pb-28' : 'pb-8'}`}
      >
        {viewContent}
      </main>

      {navVisible && (
        <BottomNav
          active={view.name === 'archive' || view.name === 'detail' ? 'archive' : 'home'}
          onNavigate={(tab: MainTab) =>
            setView(tab === 'home' ? { name: 'home' } : { name: 'archive' })
          }
        />
      )}
    </div>
  )
}
