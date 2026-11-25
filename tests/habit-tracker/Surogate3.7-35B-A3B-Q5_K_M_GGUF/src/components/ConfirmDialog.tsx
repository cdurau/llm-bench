// --- Small confirmation dialog ---

import { useEffect } from 'react';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Löschen',
  cancelLabel = 'Abbrechen',
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-lg p-6 mx-auto animate-scale-in">
        <h3 className="text-base font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-lg border border-border-strong text-sm font-medium text-ink bg-surface-alt active:scale-[0.98] transition-transform"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`flex-1 h-12 rounded-lg text-sm font-medium text-white active:scale-[0.98] transition-transform ${
              danger ? 'bg-[#9F2F2D]' : 'bg-ink'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
