import { type CSSProperties, type ReactNode } from 'react';

export type IconName =
  | 'check'
  | 'flame'
  | 'chart'
  | 'sliders'
  | 'plus'
  | 'pencil'
  | 'trash'
  | 'x'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'download'
  | 'calendar'
  | 'sparkle'
  | 'mood'
  | 'layers'
  | 'circleCheck';

const paths: Record<IconName, ReactNode> = {
  check: <path d="M4.5 12.5l4.5 4.5L19.5 7" strokeLinecap="round" strokeLinejoin="round" />,
  flame: (
    <path
      d="M12 3.2c.7 3.2-.4 5-1.9 6.5C8.9 11.2 7 12.7 7 15a5 5 0 0 0 10 0c0-2.7-1.5-4.2-2.6-5.6-.2 1.1-.9 2-1.9 2.5.6-2.7-.3-6.3-1.6-8.7z"
      strokeLinejoin="round"
    />
  ),
  chart: (
    <g strokeLinecap="round">
      <path d="M5 19.5v-6" />
      <path d="M10.5 19.5V7.5" />
      <path d="M16 19.5v-9" />
      <path d="M3 19.5h18" strokeWidth="1.6" />
    </g>
  ),
  sliders: (
    <g strokeLinecap="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
      <circle cx="10" cy="7" r="2.1" fill="var(--card)" strokeWidth="2.2" />
      <circle cx="15.5" cy="12" r="2.1" fill="var(--card)" strokeWidth="2.2" />
      <circle cx="7.5" cy="17" r="2.1" fill="var(--card)" strokeWidth="2.2" />
    </g>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" strokeLinecap="round" />,
  pencil: (
    <path
      d="M4.5 19.5l1.2-4.6L15.6 4.5a2.3 2.3 0 0 1 3.3 3.3L9.1 18.4l-4.6 1.1z"
      strokeLinejoin="round"
    />
  ),
  trash: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 6.5h15" />
      <path d="M9.5 4.5h5" />
      <path d="M6.5 6.5l.9 12.5a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5" />
      <path d="M10 10.5l.5 6M14 10.5l-.5 6" />
    </g>
  ),
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeLinecap="round" />,
  sun: (
    <g strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19" />
    </g>
  ),
  moon: (
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11z" strokeLinejoin="round" />
  ),
  monitor: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.8" />
      <path d="M9.5 20.5h5M12 16v4.5" />
    </g>
  ),
  download: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5v11" />
      <path d="M7.5 10.5L12 15l4.5-4.5" />
      <path d="M4.5 17.5v2a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </g>
  ),
  calendar: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </g>
  ),
  sparkle: (
    <path
      d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"
      strokeLinejoin="round"
    />
  ),
  mood: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 10h.01M15.5 10h.01" strokeWidth="3" />
      <path d="M8.5 14.5c1 1.4 2.1 2 3.5 2s2.5-.6 3.5-2" />
    </g>
  ),
  layers: (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 3.5l8.5 4.5L12 12.5 3.5 8 12 3.5z" />
      <path d="M3.5 12.5L12 17l8.5-4.5" />
      <path d="M3.5 16.5L12 21l8.5-4.5" />
    </g>
  ),
  circleCheck: (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.5 2.5 4.8-5.2" />
    </g>
  )
};

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 2.1
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint mb-2">
      {children}
    </p>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  type = 'button',
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-[15px] font-semibold text-accent-fg transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = '',
  'aria-label': ariaLabel
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-subtle ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  onClick,
  ariaLabel,
  className = ''
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-ink ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  style
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div style={style} className={`rounded-2xl border border-line bg-card shadow-card ${className}`}>
      {children}
    </div>
  );
}
