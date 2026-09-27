import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { load, save } from '../lib/storage';
import { reducer } from './store';
import { AppContext, type AppContextValue } from './app-context';
import { ToastProvider } from './Toasts';
import { useToast } from './useToast';

/**
 * Hält das AppData im Reducer, lädt einmalig aus localStorage und speichert bei
 * jeder Änderung zurück.
 *
 * Sonderfall „corrupt“: Nicht lesbare Daten werden beim ersten Rendern nicht
 * sofort überschrieben – der kaputte Zustand bleibt bestehen, bis der Nutzer
 * tatsächlich etwas ändert (damit das Banner bei jedem Reload ehrlich bleibt).
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // ToastProvider muss außen liegen: der innere DataProvider nutzt useToast().
  return (
    <ToastProvider>
      <AppDataProvider>{children}</AppDataProvider>
    </ToastProvider>
  );
}

function AppDataProvider({ children }: { children: ReactNode }) {
  const loaded = useMemo(() => load(), []);
  const [data, dispatch] = useReducer(reducer, loaded.data);
  const [recovery, setRecovery] = useState(loaded.recovery);
  const { pushToast } = useToast();

  const firstRun = useRef(true);
  const startedCorrupt = useRef(loaded.recovery === 'corrupt');

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (startedCorrupt.current) return; // erst nach echten Änderungen überschreiben
    }
    if (!save(data)) {
      pushToast(
        'Änderung konnte nicht gespeichert werden – der Browser-Speicher ist voll oder gesperrt.',
      );
    }
  }, [data, pushToast]);

  useEffect(() => {
    if (startedCorrupt.current && !firstRun.current) {
      // Erste echte Änderung persistiert → kaputter Zustand wurde ersetzt.
      startedCorrupt.current = false;
      setRecovery('ok');
    }
  }, [data]);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      recovery,
      dispatch,
      dismissRecovery: () => setRecovery('ok'),
    }),
    [data, recovery],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
