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
      includeAssets: ['icons/icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fokusrad',
        short_name: 'Fokusrad',
        description:
          'Der 5-Minuten-Gedanken-Shift: 8 entlastende Sätze rund um ein Zielgefühl – ruhig, warm und komplett offline.',
        theme_color: '#f2eee4',
        background_color: '#f2eee4',
        display: 'standalone',
        lang: 'de',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
      },
      // SW nur im Build/Preview aktivieren – im Dev-Modus würde autoUpdate
      // bei jedem Code-Ändern die Seite neu laden.
      devOptions: { enabled: false },
    }),
  ],
})
