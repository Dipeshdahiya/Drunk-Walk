import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  // Use relative asset paths so the build runs correctly when uploaded to portals like CrazyGames.
  base: './',
  plugins: [
    // Base44 plugin removed to make the project run without Base44-specific tooling.
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});