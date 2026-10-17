import { useEffect, useState } from 'react'

/**
 * Aktueller Zeitpunkt, pro Minute aktualisiert – damit Datum, Fortschritt
 * und „heute“-Bezüge auch über Mitternacht hinaus aktuell bleiben, ohne
 * in jeder Render-Runde neu berechnet zu werden.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  return now
}
