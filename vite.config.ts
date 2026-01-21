import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: [
      'eneida-fizzier-predeliberately.ngrok-free.dev',
      '.ngrok-free.dev', // Allow all ngrok-free.dev subdomains
      '.ngrok.io', // Allow all ngrok.io subdomains
    ],
  },
})
