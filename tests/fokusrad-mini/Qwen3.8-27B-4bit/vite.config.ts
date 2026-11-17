import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Statische Dateien aus public/, die nicht über die Manifest-Icons
      // mit in den Precache kämen (Manifest-Icons werden automatisch precached).
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Fokusrad',
        short_name: 'Fokusrad',
        description:
          'Ein 5-Minuten-Gedanken-Shift: Fülle acht Segmente rund um dein Zielgefühl und bringe deine Stimmung sanft in Bewegung.',
        lang: 'de',
        theme_color: '#f6f1e8',
        background_color: '#f6f1e8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Alles läuft lokal: externe Ressourcen gibt es nicht,
            // aber falls doch (z. B. Fonts) CacheFirst mit TTL.
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fokusrad-images-v1',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        // PWA-Features (Service Worker) auch während `npm run dev` testen.
        enabled: false
      }
    })
  ],
  server: {
    // Damit die App auch von echten Smartphones im LAN erreichbar ist.
    host: true
  }
})
