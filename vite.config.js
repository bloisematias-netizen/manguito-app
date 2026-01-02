import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    base: '/manguito-app/', // ← ¡Agrega esta línea!
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Manguito App',
        short_name: 'Manguito',
        description: 'App instalable para gestión de manguitos.',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#38bdf8',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
