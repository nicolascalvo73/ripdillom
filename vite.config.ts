import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En producción se sirve bajo /dillom/ (labs.mondistudio.com.ar/dillom, que el hub proxea a GitHub Pages); BASE_PATH lo cambia para otro destino
// preview sirve dist/, así que necesita la misma base que el build
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? (process.env.BASE_PATH ?? '/dillom/') : '/',
  plugins: [react()],
}))
