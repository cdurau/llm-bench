import { useCallback, useEffect, useState } from 'react'
import { subscribe, refreshSnapshot, type Snapshot } from './store'

/**
 * Hält den gesamten App-Zustand synchron mit der Datenbank.
 * Beim jedem Change (subscribe) wird der Snapshot neu gelesen.
 */
export function useData(): Snapshot | null {
  const [data, setData] = useState<Snapshot | null>(null)

  const load = useCallback(() => {
    refreshSnapshot().then(setData)
  }, [])

  useEffect(() => {
    const off = subscribe(load)
    load()
    return off
  }, [load])

  return data
}
