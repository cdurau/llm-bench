import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, props: IconProps) {
  const { size: _size, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  };
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props.size ?? 14, props)}>
      <path d="M3 8.5 6.2 11.5 13 4.5" />
    </svg>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...base(props.size ?? 15, props)}>
      <path d="M11.3 2.7a1.7 1.7 0 0 1 2.4 2.4L5 13.8l-3.2.9.9-3.2 8.6-8.8Z" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props.size ?? 15, props)}>
      <path d="M2.5 4.5h11M6.5 2.5h3M4.5 4.5 5.3 13h5.4l.8-8.5M6.7 7v4M9.3 7v4" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props.size ?? 15, props)}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props.size ?? 16, props)}>
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props.size ?? 16, props)}>
      <path d="m6 3 5 5-5 5" />
    </svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <svg {...base(props.size ?? 15, props)}>
      <path d="M3 8h10" />
    </svg>
  );
}
