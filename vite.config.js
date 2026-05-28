import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/inventory': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/purchase-orders': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/profiles': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false
      },
      '/api/v1/analytics': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
