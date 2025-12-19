import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

// Generate version in the same format as Docker images: react-YYYYMMDD-N
function generateVersion() {
  // Check if APP_VERSION env var is set (from Docker build)
  if (process.env.APP_VERSION) {
    console.log(`Using version from environment: ${process.env.APP_VERSION}`)
    return process.env.APP_VERSION
  }

  try {
    // Try to get latest git tag that matches our version pattern
    const latestTag = execSync('git describe --tags --match "react-*" --abbrev=0 2>/dev/null || echo ""', {
      encoding: 'utf-8'
    }).trim()

    if (latestTag && latestTag.startsWith('react-')) {
      console.log(`Using latest git tag: ${latestTag}`)
      return latestTag
    }
  } catch (err) {
    // Git command failed, continue to generate new version
  }

  // Generate new version based on current date
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  try {
    // Count existing tags for today
    const tags = execSync(`git tag -l "react-${dateStr}-*" 2>/dev/null || echo ""`, {
      encoding: 'utf-8'
    }).trim()

    const count = tags ? tags.split('\n').filter(t => t).length : 0
    const version = `react-${dateStr}-${count + 1}`

    console.log(`Generated new version: ${version}`)
    return version
  } catch (err) {
    // Fallback to dev if git is not available
    console.log('Git not available, using development version')
    return 'dev'
  }
}

// Plugin to update service worker cache version on build
const serviceWorkerPlugin = () => ({
  name: 'service-worker-cache-version',
  closeBundle() {
    const swPath = join(process.cwd(), 'public', 'sw.js')
    const distSwPath = join(process.cwd(), 'dist', 'sw.js')
    const versionPath = join(process.cwd(), 'dist', 'version.json')

    // Generate version
    const version = generateVersion()
    const buildDate = new Date().toISOString()
    const cacheVersion = Date.now().toString()

    // Read the service worker template
    let swContent = readFileSync(swPath, 'utf-8')

    // Replace the cache version placeholder
    swContent = swContent.replace('__CACHE_VERSION__', cacheVersion)

    // Write to dist folder
    writeFileSync(distSwPath, swContent)

    // Create version.json for the app to read
    const versionInfo = {
      version: version,
      buildDate: buildDate,
      buildTimestamp: parseInt(cacheVersion),
      cacheVersion: cacheVersion
    }
    writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2))

    console.log(`✓ Service Worker updated with cache version: ${cacheVersion}`)
    console.log(`✓ Version info written: ${version}`)
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
