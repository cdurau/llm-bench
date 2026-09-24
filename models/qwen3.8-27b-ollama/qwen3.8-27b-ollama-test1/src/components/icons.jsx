// Small, dependency-free inline SVG icons. Each accepts `size` and inherits
// `currentColor` so it follows the text/color of its parent.

function svgProps(size) {
   return {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      focusable: false,
    }
}

export function SunIcon({ size = 20 }) {
   return (
       <svg {...svgProps(size)}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
       </svg>
   )
}

export function MoonIcon({ size = 20 }) {
   return (
       <svg {...svgProps(size)}>
          <path d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5a8.2 8.2 0 1 0 10.7 10.7Z" />
       </svg>
   )
}

export function PlusIcon({ size = 20 }) {
   return (
       <svg {...svgProps(size)}>
          <path d="M12 5v14M5 12h14" />
       </svg>
   )
}

export function CheckIcon({ size = 20 }) {
   return (
       <svg {...svgProps(size)}>
          <path d="M5 12.5l4.4 4.4L19 7" />
       </svg>
   )
}

export function PencilIcon({ size = 18 }) {
   return (
       <svg {...svgProps(size)}>
          <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
          <path d="M13.5 6.5l3 3" />
       </svg>
   )
}

export function TrashIcon({ size = 18 }) {
   return (
       <svg {...svgProps(size)}>
          <path d="M4 7h16" />
          <path d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7" />
          <path d="M6 7l1 12.2A2 2 0 0 0 9 21h6a2 2 0 0 0 2-1.8L18 7" />
          <path d="M10 11v6M14 11v6" />
       </svg>
   )
}

// The app mark: a rounded square with a check, used in the header and favicon.
export function MarkIcon({ size = 34 }) {
   return (
       <svg
          width={size}
          height={size}
          viewBox="0 0 34 34"
          fill="none"
          aria-hidden
          focusable={false}
       >
          <rect x="1.2" y="1.2" width="31.6" height="31.6" rx="9" fill="currentColor" />
          <path
             d="M9.5 17.5L14.5 22.5L25 10.5"
             stroke="var(--accent-ink, #fff)"
             strokeWidth="3"
             strokeLinecap="round"
             strokeLinejoin="round"
             fill="none"
          />
       </svg>
   )
}
