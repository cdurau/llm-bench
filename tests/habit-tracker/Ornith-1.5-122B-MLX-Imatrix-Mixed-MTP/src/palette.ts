/** Zurückhaltende, differenzierbare Akzentfarben für Habits. */
export interface PaletteColor {
  id: string
  name: string
  /** Hex-Wert der Fläche. */
  value: string
}

export const PALETTE: PaletteColor[] = [
  { id: 'sage', name: 'Salbei', value: '#5E8C61' },
  { id: 'clay', name: 'Terracotta', value: '#C0785A' },
  { id: 'sky', name: 'Himmel', value: '#5A86B0' },
  { id: 'plum', name: 'Pflaume', value: '#8A5A8C' },
  { id: 'gold', name: 'Bernstein', value: '#C79A3C' },
  { id: 'rose', name: 'Rose', value: '#C46E7E' },
  { id: 'slate', name: 'Schiefer', value: '#55657A' },
  { id: 'sand', name: 'Sand', value: '#B09E7A' },
]

export const DEFAULT_COLOR = PALETTE[0].id

/**
 * Relative Luminanz eines Hex-Farbwerts (0..1).
 */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(1, 3), 16) / 255
  const g = parseInt(h.slice(3, 5), 16) / 255
  const b = parseInt(h.slice(5, 7), 16) / 255
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

/**
 * Rückgibt, ob auf dieser Farbe heller (weiß) oder dunkler Text besser lesbar ist.
 * Entscheidet anhand der WCAG-Kontrastdifferenz.
 */
export function textColorFor(hex: string): string {
  const whiteLum = luminance('#ffffff')
  const blackLum = luminance('#000000')
  const cWhite = (Math.max(whiteLum, 0.05) + 0.05) / (Math.min(whiteLum, 0.05) + 0.05)
  const cBlack = (Math.max(blackLum, 0.05) + 0.05) / (Math.min(blackLum, 0.05) + 0.05)
  return cBlack > cWhite ? '#1a1a1a' : '#ffffff'
}

export function getColor(id: string): PaletteColor {
  return PALETTE.find((c) => c.id === id) ?? PALETTE[0]
}
