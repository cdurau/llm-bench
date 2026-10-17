// Handgezeichnete SVG-Primitive (einheitliche Strichstärke, kein Icon-Library-Look).

interface IconProps {
  className?: string
}

function StrokeIcon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconToday({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="4" />
      <path d="M3.5 10h17" />
      <circle cx="12" cy="15" r="1.7" fill="currentColor" stroke="none" />
    </StrokeIcon>
  )
}

export function IconWeek({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M5.5 19.5v-5" />
      <path d="M12 19.5v-9" />
      <path d="M18.5 19.5v-12" />
    </StrokeIcon>
  )
}

export function IconSettings({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <circle cx="15" cy="7" r="2.2" fill="var(--surface)" />
      <circle cx="8.5" cy="12" r="2.2" fill="var(--surface)" />
      <circle cx="16.5" cy="17" r="2.2" fill="var(--surface)" />
    </StrokeIcon>
  )
}

export function IconPlus({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </StrokeIcon>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M5.5 12.5l4.2 4.2L18.5 7.5" />
    </StrokeIcon>
  )
}

export function IconFlame({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3c2 3.2 5.7 5.9 5.7 9.8a5.7 5.7 0 0 1-11.4 0c0-1.9.8-3.5 1.9-5 .4 1.1 1 2 1.9 2.7C10.3 8 10.8 5.5 12 3Z" />
    </svg>
  )
}

export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 4l2.35 4.76 5.25.77-3.8 3.7.9 5.23-4.7-2.48-4.7 2.48.9-5.23-3.8-3.7 5.25-.77L12 4Z" />
    </svg>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M5 7.5h14" />
      <path d="M9.5 7.5V5.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7" />
      <path d="M7 7.5l.9 11.2c.1.9.8 1.6 1.7 1.6h4.8c.9 0 1.6-.7 1.7-1.6L17 7.5" />
      <path d="M10.2 11.5v4.5" />
      <path d="M13.8 11.5v4.5" />
    </StrokeIcon>
  )
}

export function IconPencil({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5Z" />
      <path d="M12.5 7.5l4 4" />
    </StrokeIcon>
  )
}

export function IconSun({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M5.6 5.6L7 7" />
      <path d="M17 17l1.4 1.4" />
      <path d="M18.4 5.6L17 7" />
      <path d="M7 17l-1.4 1.4" />
    </StrokeIcon>
  )
}

export function IconMoon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M19.5 13.5A8 8 0 0 1 10.5 4.5a8 8 0 1 0 9 9Z" />
    </StrokeIcon>
  )
}

export function IconMonitor({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <rect x="3.5" y="5" width="17" height="11" rx="2" />
      <path d="M9 19.5h6" />
      <path d="M12 16v3.5" />
    </StrokeIcon>
  )
}

/** Puls-Kurve – das Markenzeichen der App (auch für Leerzustände). */
export function IconPulse({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 12h4.5l2-3.5 3 7 2-5.5 1.5 2H21" />
    </StrokeIcon>
  )
}
