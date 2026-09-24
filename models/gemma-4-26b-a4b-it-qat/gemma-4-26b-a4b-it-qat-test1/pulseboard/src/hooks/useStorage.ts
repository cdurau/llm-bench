import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { AppState, Activity, DayStatus } from '../types';

export const useStorage = () => {
  const [state, setState] = useState<AppState>(() => storageService.load());

  const saveState = useCallback((newState: AppState) => {
    const validatedState = storageService.validateState(newState);
    setState(validatedState);
    storageService.save(validatedState);
  }, []);

  return { state, saveState };
};
