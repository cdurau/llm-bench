// src/pwa.ts - Service Worker Registration
export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Update on reload
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// src/sw.ts - Service Worker
export const swCode = `
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// Precache all files
precacheAndRoute(self.__WB_MANIFEST);

// Cleanup outdated caches
cleanupOutdatedCaches();

// API routes - use NetworkFirst strategy
registerRoute(
  \\/api\\/.*,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);

// Static assets - use StaleWhileRevalidate
registerRoute(
  /\\.(?:png|jpg|jpeg|svg|gif|ico)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
  })
);
`;
