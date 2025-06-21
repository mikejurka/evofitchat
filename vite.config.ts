import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '9ae1-2001-5a8-4121-ac00-b9b5-a22b-eb9d-f787.ngrok-free.app',
    ]
  }
})
