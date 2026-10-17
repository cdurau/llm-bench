import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// PWA-Konfiguration nach dem Pattern von vite-pwa-patterns:
// - generateSW (automatischer Service Worker)
// - registerType: 'autoUpdate' (nahtlose Updates, vom Skill empfohlen)
// - Precache aller Build-Assets, navigateFallback auf index.html
//   -> nach dem ersten Laden komplett offline nutzbar
// - keine runtimeCaching-Regeln nötig: die App ruft keine externen
//   Ressourcen auf (System-Fonts, lokale Icons, Daten in IndexedDB)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Rhythm – Habit- und Stimmungs-Tracker',
        short_name: 'Rhythm',
        description: 'Habits, Streaks und Stimmung – lokal, offline, privat.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F5F1',
        theme_color: '#F7F5F1',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
