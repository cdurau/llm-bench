import type { ReactElement } from 'react'

interface WheelGlyphProps {
  size?: number
  className?: string
}

/**
 * Kompaktes Fokusrad-Emblem für Header und Navigation:
 * acht Segmente rund um ein Zentrum, in den Radfarben der App.
 */
export function WheelGlyph({ size = 20, className }: WheelGlyphProps): ReactElement {
  const segments = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const start = i * 45 + 2
    const end = (i + 1) * 45 - 2
    const toPoint = (r: number, deg: number): string => {
      const rad = ((deg - 90) * Math.PI) / 180
      return `${(12 + r * Math.cos(rad)).toFixed(2)} ${(12 + r * Math.sin(rad)).toFixed(2)}`
    }
    return (
      <path
        key={i}
        d={`M ${toPoint(10, start)} A 10 10 0 0 1 ${toPoint(10, end)} L ${toPoint(5, end)} A 5 5 0 0 0 ${toPoint(5, start)} Z`}
        fill={`var(--wheel-${i + 1})`}
      />
    )
  })

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {segments}
      <circle cx={12} cy={12} r={4.2} fill="var(--surface)" stroke="var(--line)" strokeWidth={0.8} />
    </svg>
  )
}
