import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Rhythm – Habit- & Stimmungs-Tracker',
        short_name: 'Rhythm',
        description:
          'Ruhiger, offlinefähiger Tracker für tägliche Gewohnheiten und Stimmung. Alle Daten bleiben auf deinem Gerät.',
        lang: 'de',
        theme_color: '#FBFAF8',
        background_color: '#FBFAF8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        // SPA-Shell bleibt offline nutzbar; Navigationen ohne Treffer zeigen die Offline-Seite.
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/icons\//],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
