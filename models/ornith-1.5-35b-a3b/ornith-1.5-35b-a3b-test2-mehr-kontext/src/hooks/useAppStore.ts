import { useEffect, useMemo, useState } from 'react'
import { createStore, type Store } from '../store/createStore'
import type { ActivityInput, NewActivityInput } from '../types'
import type { AppState } from '../store/createStore'

export interface AppActions {
  setSelectedDate: (date: string) => void
  addActivity: (input: NewActivityInput) => Activity | null
  editActivity: (id: string, input: ActivityInput) => boolean
  deleteActivity: (id: string) => void
  toggleComplete: (activityId: string, date: string) => void
  reload: () => void
  reset: () => void
}

/**
 * React-Wrapper um die reine Speicherfabrik. Haltet den Zustand synchron und
 * schreibt Änderungen persist in den Storage.
 */
export function useAppStore(): AppState & AppActions {
  const store = useMemo<Store>(() => createStore(), [])

  const [state, setState] = useState<AppState>(() => store.getState())

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()))
  }, [store])

  const actions = useMemo<AppActions>(
    () => ({
      setSelectedDate: (date) => store.setSelectedDate(date),
      addActivity: (input) => store.addActivity(input),
      editActivity: (id, input) => store.editActivity(id, input),
      deleteActivity: (id) => store.deleteActivity(id),
      toggleComplete: (activityId, date) => store.toggleComplete(activityId, date),
      reload: () => store.reload(),
      reset: () => store.reset(),
    }),
    [store],
  )

  return { ...state, ...actions }
}
