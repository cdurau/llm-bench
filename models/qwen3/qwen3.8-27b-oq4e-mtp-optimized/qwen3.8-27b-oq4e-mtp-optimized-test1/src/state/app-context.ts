import { createContext } from 'react';
import type { AppData, Recovery } from '../lib/types';
import type { Action } from './store';

export interface AppContextValue {
  data: AppData;
  /** Wie der gespeicherte Zustand beim Laden eingestuft wurde. */
  recovery: Recovery;
  dispatch: (action: Action) => void;
  dismissRecovery: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
