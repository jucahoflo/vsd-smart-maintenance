import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
