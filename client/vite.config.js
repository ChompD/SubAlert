import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is set by the Pages workflow to "/<repository-name>/", because
// a GitHub project page is served from a subfolder, not the root of the domain.
// Everywhere else (local dev, Vercel, Netlify, a custom domain) the root is
// correct, so the default is "/". Page 7 of content/extending-your-app explains
// what goes wrong without this: a blank white page and 404s on every asset.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    // Only used by `npm run dev`. It is NOT part of the production build, which
    // is why the deployed site needs CORS and this does not. See page 8.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
