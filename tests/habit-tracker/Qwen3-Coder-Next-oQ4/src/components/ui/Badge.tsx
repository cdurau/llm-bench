import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'md' }: BadgeProps) {
  const variants = {
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    neutral: 'bg-gray-50 text-gray-600 border-gray-100',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span className={`
      inline-flex items-center
      rounded-full border
      ${variants[variant]} ${sizes[size]}
    `}>
      {children}
    </span>
  );
}
