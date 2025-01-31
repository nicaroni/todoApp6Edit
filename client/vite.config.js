import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: {
      usePolling: true, // Fixes issues with WSL or Docker
    },
    hmr: {
      overlay: false, // Prevents overlay issues
    },
  },
})
