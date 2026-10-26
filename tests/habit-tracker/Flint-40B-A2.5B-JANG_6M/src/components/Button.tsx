import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'soft' | 'ghost' | 'quiet' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  block?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-canvas hover:opacity-90',
  soft: 'bg-accent-soft text-accent-strong hover:opacity-90',
  ghost: 'border border-line bg-surface text-muted hover:text-ink hover:border-faint',
  quiet: 'bg-elevated text-ink hover:opacity-90',
  danger: 'bg-[#9f2f2d] text-white hover:opacity-90',
}

export function Button({
  variant = 'primary',
  block = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
}