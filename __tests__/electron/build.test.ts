import { describe, it, expect, beforeEach } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

describe('Electron build', () => {
  const projectRoot = process.cwd()
  const distDir = path.join(projectRoot, 'dist')
  const distElectronDir = path.join(projectRoot, 'dist-electron')

  describe('build output exists', () => {
    it('should have dist/index.html', () => {
      const indexPath = path.join(distDir, 'index.html')
      expect(existsSync(indexPath)).toBe(true)
    })

    it('should have dist-electron/main.js', () => {
      const mainPath = path.join(distElectronDir, 'main.js')
      expect(existsSync(mainPath)).toBe(true)
    })

    it('should have dist-electron/preload.js', () => {
      const preloadPath = path.join(distElectronDir, 'preload.js')
      expect(existsSync(preloadPath)).toBe(true)
    })

    it('should have assets directory with JS bundle', () => {
      const assetsDir = path.join(distDir, 'assets')
      expect(existsSync(assetsDir)).toBe(true)
      const jsFiles = require('fs').readdirSync(assetsDir).filter(f => f.endsWith('.js'))
      expect(jsFiles.length).toBeGreaterThan(0)
    })
  })

  describe('HTML asset references', () => {
    let htmlContent: string
    let mainContent: string

    beforeEach(() => {
      const indexPath = path.join(distDir, 'index.html')
      htmlContent = readFileSync(indexPath, 'utf-8')
      const mainPath = path.join(distElectronDir, 'main.js')
      mainContent = readFileSync(mainPath, 'utf-8')
    })

    it('should either have relative paths OR use HTTP server', () => {
      const scriptMatch = htmlContent.match(/<script[^>]+src="([^"]+\.js)"[^>]*>/)
      const cssMatch = htmlContent.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)

      const paths = [scriptMatch?.[1], cssMatch?.[1]].filter(Boolean) as string[]
      const hasAbsolutePaths = paths.some(p => p.startsWith('/'))

      if (hasAbsolutePaths) {
        expect(mainContent).toContain('http.createServer')
      } else {
        expect(true).toBe(true)
      }
    })

    it('should have all referenced assets exist', () => {
      const scriptMatch = htmlContent.match(/<script[^>]+src="([^"]+\.js)"[^>]*>/)
      const cssMatch = htmlContent.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)

      if (scriptMatch?.[1]) {
        const jsPath = path.join(distDir, scriptMatch[1])
        expect(existsSync(jsPath)).toBe(true)
      }

      if (cssMatch?.[1]) {
        const cssPath = path.join(distDir, cssMatch[1])
        expect(existsSync(cssPath)).toBe(true)
      }
    })
  })

  describe('electron main.js implementation', () => {
    let mainContent: string

    beforeEach(() => {
      const mainPath = path.join(distElectronDir, 'main.js')
      mainContent = readFileSync(mainPath, 'utf-8')
    })

    it('should use HTTP server approach for loading dist', () => {
      expect(mainContent).toContain('http.createServer')
    })

    it('should listen on a port', () => {
      expect(mainContent).toMatch(/listen\s*\(\s*\d+/)
    })

    it('should load URL after server starts', () => {
      expect(mainContent).toContain('loadURL')
    })
  })
})