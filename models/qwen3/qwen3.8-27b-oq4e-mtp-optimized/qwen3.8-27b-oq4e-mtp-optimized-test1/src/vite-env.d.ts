/// <reference types="vite/client" />

declare module '*.css';

/**
 * Typen für das virtuelle Modul der PWA-Registrierung (von vite-plugin-pwa
 * zur Buildzeit generiert; in Tests per Alias auf ein Stub gemappt).
 * Spiegelt `vite-plugin-pwa/vanillajs.d.ts`.
 */
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegisteredSW?: (url: string, registration: ServiceWorker | null) => void;
  }
  export function registerSW(
    options?: RegisterSWOptions,
  ): (reloadPage?: boolean) => Promise<void>;
}
