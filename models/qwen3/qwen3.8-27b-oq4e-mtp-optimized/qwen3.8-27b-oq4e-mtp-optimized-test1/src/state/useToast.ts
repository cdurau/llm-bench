import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from './toast-context';

/** Zugriff auf die Toast-Api (push/dismiss). */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast muss innerhalb von <ToastProvider> verwendet werden');
  return ctx;
}
