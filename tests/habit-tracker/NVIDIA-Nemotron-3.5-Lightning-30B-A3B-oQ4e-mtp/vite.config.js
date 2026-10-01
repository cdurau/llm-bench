import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Use public index.html as entry point
    rollupOptions: {
      input: 'public/index.html',
    },
  }
})
