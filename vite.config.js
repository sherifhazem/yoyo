import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Vercel serves the app from the domain root; GitHub Pages serves it under /yoyo/.
  base: process.env.VERCEL ? '/' : '/yoyo/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
