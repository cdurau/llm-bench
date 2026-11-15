const CX = 110
const CY = 110
const OUTER = 98
const INNER = 64
const GAP_DEG = 2.2

const rad = (deg: number) => (deg * Math.PI) / 180
const px = (deg: number, r: number) => (CX + r * Math.cos(rad(deg))).toFixed(2)
const py = (deg: number, r: number) => (CY + r * Math.sin(rad(deg))).toFixed(2)

/** Kreissegment (Ringsektor) für Slot i, startend oben, im Uhrzeigersinn. */
function segmentPath(i: number): string {
  const a0 = -90 + i * 45 + GAP_DEG
  const a1 = -90 + (i + 1) * 45 - GAP_DEG
  return [
    `M ${px(a0, OUTER)} ${py(a0, OUTER)}`,
    `A ${OUTER} ${OUTER} 0 0 1 ${px(a1, OUTER)} ${py(a1, OUTER)}`,
    `L ${px(a1, INNER)} ${py(a1, INNER)}`,
    `A ${INNER} ${INNER} 0 0 0 ${px(a0, INNER)} ${py(a0, INNER)}`,
    'Z',
  ].join(' ')
}

/** Zielgedanke in kurze Zeilen brechen (max. 4 Zeilen im Zentrum). */
function wrap(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (line && `${line} ${word}`.length > 16) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

interface FocusWheelSvgProps {
  thoughts: string[]
  targetThought: string
  /** Noch leerer, als nächstes gefüllter Slot – wird dezent pulsierend markiert. */
  activeIndex?: number | null
  /** Sanftes Glühen, wenn das Rad komplett ist. */
  glow?: boolean
  className?: string
}

export default function FocusWheelSvg({
  thoughts,
  targetThought,
  activeIndex,
  glow,
  className,
}: FocusWheelSvgProps) {
  const filled = thoughts.map((t) => t.trim().length > 0)
  const count = filled.filter(Boolean).length
  const lines = wrap(targetThought.trim() || 'Zielgedanke')
  const fontSize = lines.length > 3 ? 11 : 13
  const lineHeight = 15

  return (
    <div className={`rounded-full ${glow ? 'animate-glow' : ''} ${className ?? ''}`}>
      <svg
        viewBox="0 0 220 220"
        role="img"
        aria-label={`Fokusrad: ${count} von 8 Gedanken eingefärbt`}
        className="h-auto w-full"
      >
        {Array.from({ length: 8 }, (_, i) => {
          const isActive = activeIndex === i && !filled[i]
          return (
            <path
              key={i}
              d={segmentPath(i)}
              className={`wheel-seg${filled[i] ? ' wheel-seg-filled' : ''}${isActive ? ' wheel-seg-active' : ''}`}
            />
          )
        })}
        <circle
          cx={CX}
          cy={CY}
          r={INNER - 6}
          fill="var(--wheel-center)"
          stroke="var(--line)"
          strokeWidth={1.5}
        />
        <text
          x={CX}
          textAnchor="middle"
          fill="var(--ink)"
          fontSize={fontSize}
          fontWeight={600}
          dominantBaseline="middle"
        >
          {lines.map((l, i) => (
            <tspan
              key={i}
              x={CX}
              y={CY - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight}
            >
              {l}
            </tspan>
          ))}
        </text>
      </svg>
    </div>
  )
}
