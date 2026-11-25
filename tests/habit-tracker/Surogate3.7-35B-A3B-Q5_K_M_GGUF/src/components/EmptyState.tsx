// --- Empty states ---

import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center text-ink-faint mb-5">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-ink mb-2">{title}</h2>
      <p className="text-sm text-ink-muted leading-relaxed max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
