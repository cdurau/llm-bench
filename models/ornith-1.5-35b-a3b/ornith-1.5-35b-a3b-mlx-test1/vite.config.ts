/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from '@vitejs/plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    // PWA is only enabled for real builds (dev / preview / production),
    // never during the test run.
    mode === 'test'
      ? undefined
      : VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'icons/*.svg'],
          manifest: {
            name: 'PulseBoard',
            short_name: 'PulseBoard',
            description:
              'Minimalistische persönliche Tagesübersicht für Aktivitäten und Gewohnheiten.',
            theme_color: '#0f172a',
            background_color: '#f1f5f9',
            display: 'standalone',
            start_url: './',
            scope: './',
            icons: [
              { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
              { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
              {
                src: 'icons/icon-512-maskable.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
            navigateFallback: 'index.html',
            cleanupOutdatedCaches: true,
            sourcemap: false,
          },
          devOptions: {
            enabled: false,
          },
        }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
}));
