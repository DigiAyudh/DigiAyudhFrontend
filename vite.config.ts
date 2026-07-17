import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Allow any Vercel preview subdomain (e.g. sb-xxxx.vercel.run) plus local dev.
    // A leading dot makes Vite match all subdomains of that domain, so new
    // preview hosts work automatically without editing this file again.
    allowedHosts: ['.vercel.run', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
