import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(import.meta.dirname, 'node_modules/react'),
      'react-dom': path.resolve(import.meta.dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(import.meta.dirname, 'node_modules/react-router-dom'),
    }
  },
  // Allow Vite to resolve files from sibling folders (teamRegistration, teamReview)
  server: {
    fs: {
      // Allow serving files from the whole FrontEnd directory
      allow: [path.resolve(import.meta.dirname, '..')]
    }
  }
})
