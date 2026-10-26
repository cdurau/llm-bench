import type { SVGProps } from 'react'

/** Inline-SVG-Primitiven im Stil dicker, einheitlicher Striche (Phosphor/Radix). */

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5 10.5 18 19 7" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="16" rx="3" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z" />
    </svg>
  )
}

export function SunMoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v2M5.5 6.5l1.4 1.4M18.5 6.5l-1.4 1.4M3 12h2M19 12h2" />
      <path d="M17 15.5a7 7 0 1 1-8.5-8.5 5.5 5.5 0 0 0 8.5 8.5Z" />
    </svg>
  )
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4v16M4 20h16" />
      <path d="M8 15l3-4 3 3 4-6" />
    </svg>
  )
}

export function GearIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M4.5 12H2.5M21.5 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10.5V20a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-8.5" />
    </svg>
  )
}

export function PenIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15.5 5.5 18 8 7 19l-3 1 1-3Z" />
      <path d="M13.5 3a2 2 0 0 1 3 3L7 14l-3 1 1-3Z" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c1.5 2.5 3 4 3 6.5a4.5 4.5 0 0 1-9 0C6 8 8 6.5 9.5 4.5 10 5 11 5.5 12 6Z" />
      <path d="M12 16.5c-1.4 0-2.5-1.2-2.5-2.7 0-1.2.8-2.2 1.5-3 .2.8.5 1.4 1 1.9" />
    </svg>
  )
}
