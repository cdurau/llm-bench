import { createContext } from 'react';

export type ToastTone = 'info' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
