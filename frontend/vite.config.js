import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Plugin to update service worker cache version on build
const serviceWorkerPlugin = () => ({
  name: 'service-worker-cache-version',
  closeBundle() {
    const swPath = join(process.cwd(), 'public', 'sw.js')
    const distSwPath = join(process.cwd(), 'dist', 'sw.js')
    const versionPath = join(process.cwd(), 'dist', 'version.json')

    // Generate version based on timestamp
    const cacheVersion = Date.now().toString()
    const buildDate = new Date().toISOString()

    // Read the service worker template
    let swContent = readFileSync(swPath, 'utf-8')

    // Replace the cache version placeholder
    swContent = swContent.replace('__CACHE_VERSION__', cacheVersion)

    // Write to dist folder
    writeFileSync(distSwPath, swContent)

    // Create version.json for the app to read
    const versionInfo = {
      version: cacheVersion,
      buildDate: buildDate,
      buildTimestamp: parseInt(cacheVersion)
    }
    writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2))

    console.log(`✓ Service Worker updated with cache version: ${cacheVersion}`)
    console.log(`✓ Version info written to version.json`)
  }
})

export default defineConfig({
  plugins: [
    react(),
    serviceWorkerPlugin()
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/images': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
