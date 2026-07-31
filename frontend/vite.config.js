import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Esto obliga a Vite a usar el empaquetador clásico y evita el bug de Rolldown
      output: {
        manualChunks: undefined
      }
    }
  }
})
