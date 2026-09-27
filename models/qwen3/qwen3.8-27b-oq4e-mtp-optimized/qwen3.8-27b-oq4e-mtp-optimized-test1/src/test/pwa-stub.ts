/** Vitest-Stub für das virtuelle Modul `virtual:pwa-register` (PWA in Tests aus). */
function registerSW(
  _options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegisteredSW?: (url: string, registration: unknown) => void;
  },
): (reload?: boolean) => Promise<void> {
  return () => Promise.resolve();
}

export { registerSW };
export default registerSW;
