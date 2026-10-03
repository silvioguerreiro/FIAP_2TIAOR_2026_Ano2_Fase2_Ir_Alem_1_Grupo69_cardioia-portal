import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracao minima do Vite com o plugin oficial do React.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
