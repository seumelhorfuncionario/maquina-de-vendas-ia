import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      manifest: {
        name: 'Máquina de Vendas IA',
        short_name: 'Vendas IA',
        description: 'Dashboard comercial com inteligência artificial',
        theme_color: '#00D4FF',
        background_color: '#0a0a0f',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/favicon.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/apple-touch-icon.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
