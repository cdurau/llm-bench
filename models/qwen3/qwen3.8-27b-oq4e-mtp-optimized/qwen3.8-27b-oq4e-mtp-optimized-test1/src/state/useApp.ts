import { useContext } from 'react';
import { AppContext, type AppContextValue } from './app-context';

/** Zugriff auf AppData, Recovery-Status und Dispatch. */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp muss innerhalb von <AppProvider> verwendet werden');
  return ctx;
}
