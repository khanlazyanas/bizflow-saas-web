import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 🔥 PRO FIX: Ye proxy browser ko bewakoof banayegi ki backend bhi local hai
    proxy: {
      '/api': {
        target: 'https://bizzflow-backend.onrender.com', // Aapka Render URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})