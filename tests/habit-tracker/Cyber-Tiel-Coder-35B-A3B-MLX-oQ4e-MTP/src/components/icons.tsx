import type { SVGProps } from 'react'

function base(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  }
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 12.5l4.5 4L20 6" />
    </svg>
  )
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 21v-7M9 21v-11M15 21v-4M21 21v-2" />
    </svg>
  )
}

export function IconGear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.7 7.1l-2 1.4M5.3 15.5l-2 1.4M20.5 16.9l-2.2-1.2M3.5 8.1l2.2-1.2M3.5 15.9v2.2M20.5 8.1v2.2" />
    </svg>
  )
}

export function IconTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 7h14M8 7V5h8v2M6 7l1 12h10l1-12" />
    </svg>
  )
}

export function IconPen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l4-1L17 8l-2-2-7 9z" />
      <path d="M13 5l2 2" />
    </svg>
  )
}

export function IconSun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" />
    </svg>
  )
}

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A7 7 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
    </svg>
  )
}

export function IconSystem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="4" width="14" height="13" rx="2" />
      <path d="M9 19h6" />
    </svg>
  )
}

export function IconFlask(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M9 3h6M10 3v6.5L6.5 19a2 2 0 0 0 1.8 2.5h7.4a2 2 0 0 0 1.8-2.5L14 9.5V3" />
      <path d="M7.5 13h9" />
    </svg>
  )
}
