import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  css: {
    // CSS modules configuration
    modules: {
      // CSS Configuration options
      localsConvention: 'camelCase'
    }
  },
  // Set base to '/' for proper asset paths
  base: '/'
})