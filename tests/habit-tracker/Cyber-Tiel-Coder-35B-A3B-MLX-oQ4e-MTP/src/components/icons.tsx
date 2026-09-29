import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function Glyph({
  size = 20,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const SunIcon = (props: IconProps) => (
  <Glyph {...props}>
    <circle cx="12" cy="12" r="3.6" />
    <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Glyph>
)

export const ChartIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M3 20h18" />
    <path d="M6.5 20v-6M12 20V5.5M17.5 20v-9.5" />
  </Glyph>
)

export const SlidersIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M4 8h16M4 16h16" />
    <circle cx="9" cy="8" r="2.4" />
    <circle cx="15" cy="16" r="2.4" />
  </Glyph>
)

export const PlusIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Glyph>
)

export const CheckIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Glyph>
)

export const FlameIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 3c1 2.5 1 3.7.4 4.7-.5.9-1.6 1.3-2.2.5-.4-.5-.5-1.2-.3-2C7.7 7.7 6 9.9 6 12.6a6 6 0 0 0 12 0c0-3.4-2.4-6.4-6-9.6z" />
  </Glyph>
)

export const TrashIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M4 7h16" />
    <path d="M9.5 7V5.6A1.6 1.6 0 0 1 11.1 4h1.8a1.6 1.6 0 0 1 1.6 1.6V7" />
    <path d="M6.6 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
    <path d="M10 11v6M14 11v6" />
  </Glyph>
)

export const PencilIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M4 20h4L19.2 8.8a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M14.6 6.4l3 3" />
  </Glyph>
)

export const CloseIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Glyph>
)

export const MoonIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M20 14.6A7.5 7.5 0 0 1 9.4 4A7.2 7.2 0 1 0 20 14.6z" />
  </Glyph>
)

export const MonitorIcon = (props: IconProps) => (
  <Glyph {...props}>
    <rect x="3" y="4.5" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16.5V20" />
  </Glyph>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M6 9.5l6 6 6-6" />
  </Glyph>
)

export const ChevronRightIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M9.5 6l6 6-6 6" />
  </Glyph>
)

export const LeafIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14" />
    <path d="M5 19c3-4 6-6 10-7.5" />
  </Glyph>
)

export const SparkIcon = (props: IconProps) => (
  <Glyph {...props}>
    <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
  </Glyph>
)

export const CalendarIcon = (props: IconProps) => (
  <Glyph {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </Glyph>
)
