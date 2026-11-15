/** Datumsformat für Archiv-Zeilen (de-DE); leer bei ungült datum. */
export function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return ''
  }
}

/** Kurze Verschiebungsbewertung, z. B. "+2" / "stabil" / "–1". */
export function shiftBadge(start: number, end: number): string {
  const delta = end - start
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `−${Math.abs(delta)}`
  return 'stabil'
}
