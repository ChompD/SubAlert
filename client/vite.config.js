import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Only used by `npm run dev`: sends /api to the Express server on your
    // laptop. On Vercel the site and the API share one address, so the
    // production build needs no proxy.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
