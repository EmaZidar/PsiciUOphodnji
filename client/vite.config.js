import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward OAuth start and callback routes to the backend during development
      '/login/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/google/callback': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Forward any API requests to the backend as well
      '/api/register': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/calendar': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
  },
})
