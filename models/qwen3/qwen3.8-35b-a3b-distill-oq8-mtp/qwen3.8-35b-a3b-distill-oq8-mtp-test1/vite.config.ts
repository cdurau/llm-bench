import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PulseBoard',
        short_name: 'PulseBoard',
        description: 'Persönliche Tagesübersicht',
        theme_color: '#247065',
        background_color: '#FAFAF9',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
        globIgnores: ['**/tests/**'],
        runtimeCaching: [],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
