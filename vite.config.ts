import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// In production we serve from the GitHub Pages project subpath
// (https://<user>.github.io/Juegatela/). In dev we serve from root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Juegatela/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
