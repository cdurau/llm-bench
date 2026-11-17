import type { ReactElement } from 'react'

export const SEGMENT_COUNT = 8

interface FocusWheelSvgProps {
  /** Text im Zentrum des Rads (der Zielgedanke). */
  targetThought: string
  /**
   * Die acht Segmente (Index 0 = Segment 1, oben).
   * Ein leerer String bedeutet: Segment noch offen.
   */
  segments: string[]
  /** Seitliche Größe in CSS-px (Standard: flüssig über `100%` des Elternelements). */
  size?: number
  /** Segment-Nummern sichtbar machen (Standard: ja). */
  showNumbers?: boolean
  /** Zugänglicher Name, z. B. „Fokusrad: 5 von 8 Gedanken, Zentrum: …". */
  label?: string
  className?: string
}

/**
 * Rechnet einen Punkt in Polarkoordinaten um (0° = 12-Uhr-Position,
 * im Uhrzeigersinn). `degrees` ist relativ zur Mitte.
 */
function polarPoint(cx: number, cy: number, radius: number, degrees: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)]
}

function format(value: number): string {
  return value.toFixed(2)
}

/**
 * Baut den Pfadeintrag eines Ringsegments (annular sector) mit
 * `gapDeg` Grad Lücke auf jeder Seite.
 */
function segmentPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number
): string {
  const [ox1, oy1] = polarPoint(cx, cy, outerR, startDeg)
  const [ox2, oy2] = polarPoint(cx, cy, outerR, endDeg)
  const [ix2, iy2] = polarPoint(cx, cy, innerR, endDeg)
  const [ix1, iy1] = polarPoint(cx, cy, innerR, startDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${format(ox1)} ${format(oy1)}`,
    `A ${format(outerR)} ${format(outerR)} 0 ${largeArc} 1 ${format(ox2)} ${format(oy2)}`,
    `L ${format(ix2)} ${format(iy2)}`,
    `A ${format(innerR)} ${format(innerR)} 0 ${largeArc} 0 ${format(ix1)} ${format(iy1)}`,
    'Z'
  ].join(' ')
}

/**
 * Bricht Text grob um: Wort-für-Wort bis `maxChars`, ein einzelnes
 * etwas längeres Wort darf ohne Trennung eine Zeile füllen; nur
 * extrem lange Wörter werden hart geteilt. Bei `maxLines` wird der
 * letzte Zeilenabschnitt mit „…" verkürzt.
 */
function wrapCenterText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0)
  const lines: string[] = []
  let current = ''
  const hardMax = maxChars * 2

  for (const word of words) {
    if (word.length > hardMax) {
      let rest = word
      while (rest.length > hardMax) {
        if (current.length > 0) {
          lines.push(current)
          current = ''
          if (lines.length >= maxLines) return lines
        }
        lines.push(rest.slice(0, hardMax))
        rest = rest.slice(hardMax)
        if (lines.length >= maxLines) return lines
      }
      current = rest
      if (lines.length >= maxLines) return lines
      continue
    }
    const candidate = current.length > 0 ? `${current} ${word}` : word
    if (candidate.length > maxChars && current.length > 0) {
      lines.push(current)
      if (lines.length >= maxLines) return lines
      current = word
    } else {
      current = candidate
    }
  }
  if (current.length > 0) lines.push(current)

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    const last = kept[kept.length - 1]
    kept[kept.length - 1] =
      last.length > maxChars ? last.slice(0, Math.max(1, maxChars - 1)) + '…' : last
    return kept
  }
  return lines
}

/**
 * Das SVG-Fokusrad: acht Kreissegmente rund um ein Zentrum, in dem der
 * Zielgedanke steht. Gefüllte Segmente (nicht leerer Satz) nehmen die
 * Farbe des jeweiligen Radschritts (`--wheel-1` … `--wheel-8`) an und
 * färb sich weich ein (Transition in `index.css`).
 */
export function FocusWheelSvg({
  targetThought,
  segments,
  size,
  showNumbers = true,
  label,
  className
}: FocusWheelSvgProps): ReactElement {
  const cx = 100
  const cy = 100
  const outerR = 92
  const innerR = 54
  const centerR = 47
  const gapDeg = 2.8
  const perSegment = 360 / SEGMENT_COUNT

  const centerText = targetThought.trim().length > 0
    ? wrapCenterText(targetThought.trim(), 11, 4)
    : ['dein', 'Zielgefühl']

  const filled = segments.filter((s) => s.trim().length > 0).length
  const ariaLabel =
    label ??
    `Fokusrad: ${filled} von ${SEGMENT_COUNT} Gedanken, Zielgedanke: ${targetThought || 'offen'}`

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={size !== undefined ? { width: size, height: size } : undefined}
    >
      {/* Ruhiger Rahmenring */}
      <circle cx={cx} cy={cy} r={98} fill="none" stroke="var(--line)" strokeWidth={1} />

      {/* Die acht Segmente */}
      {segments.slice(0, SEGMENT_COUNT).map((text, index) => {
        const start = index * perSegment + gapDeg / 2
        const end = (index + 1) * perSegment - gapDeg / 2
        const isFilled = text.trim().length > 0
        const [nx, ny] = polarPoint(cx, cy, (innerR + outerR) / 2 + 2, index * perSegment + perSegment / 2)
        return (
          <g key={index}>
            <path
              d={segmentPath(cx, cy, innerR, outerR, start, end)}
              className="wheel-segment"
              fill={`var(--wheel-${index + 1})`}
              opacity={isFilled ? 1 : 0.55}
            />
            {showNumbers && (
              <text
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={600}
                fill={isFilled ? 'var(--seg-num)' : 'var(--ink-3)'}
                className="wheel-segment"
                style={{ pointerEvents: 'none' }}
              >
                {index + 1}
              </text>
            )}
          </g>
        )
      })}

      {/* Zentrum mit Zielgedanken */}
      <circle
        className="wheel-center"
        cx={cx}
        cy={cy}
        r={centerR}
        fill="var(--surface)"
        stroke="var(--line)"
        strokeWidth={1.5}
      />
      {centerText.map((line, index) => (
        <text
          key={index}
          x={cx}
          y={cy + (index - (centerText.length - 1) / 2) * 13}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10.5}
          fontWeight={index === 0 && centerText.length <= 2 ? 600 : 500}
          fill="var(--center-ink)"
        >
          {line}
        </text>
      ))}
    </svg>
  )
}
