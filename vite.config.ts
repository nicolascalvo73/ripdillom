import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En producción vive bajo labs.mondistudio.com.ar/ripdillom
export default defineConfig(({ command }) => ({
  base: command === 'build' ? (process.env.BASE_PATH ?? '/ripdillom/') : '/',
  plugins: [react()],
  // El proyecto vive en /mnt/c (WSL): sin polling Vite no ve los cambios
  server: { watch: { usePolling: true, interval: 300 } },
}))
