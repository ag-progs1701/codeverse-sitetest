import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow Vite to resolve files from sibling folders (teamRegistration, teamReview)
  server: {
    fs: {
      // Allow serving files from the whole FrontEnd directory
      allow: [path.resolve(__dirname, '..')]
    }
  }
})
