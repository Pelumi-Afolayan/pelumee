import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { createSpotifyHandler } from './api/spotify.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const handler = createSpotifyHandler(env)
  const spotify = { name: 'local-spotify-endpoint', configureServer(server) { server.middlewares.use('/api/spotify', handler) }, configurePreviewServer(server) { server.middlewares.use('/api/spotify', handler) } }
  return { plugins: [react(), tailwindcss(), spotify] }
})
