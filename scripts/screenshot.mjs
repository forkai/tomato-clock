import { chromium } from 'playwright'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function main() {
  // Start Vite dev server
  console.log('Starting Vite dev server...')
  const dev = spawn('npx', ['vp', 'dev', '--port', '5174'], {
    cwd: rootDir,
    stdio: 'pipe',
    shell: true
  })

  dev.stdout.on('data', d => process.stdout.write(d))
  dev.stderr.on('data', d => process.stderr.write(d))

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 8000))
  console.log('Server should be ready')

  console.log('Launching browser...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Timer page
  await page.setViewportSize({ width: 400, height: 700 })
  console.log('Navigating to timer page...')
  await page.goto('http://localhost:5174', { timeout: 15000 })
  await page.waitForLoadState('domcontentloaded')
  await new Promise(r => setTimeout(r, 2000))
  await page.screenshot({ path: path.join(rootDir, 'docs', 'screenshots', 'timer-page.png'), fullPage: false })
  console.log('timer-page.png saved')

  // Stats page
  console.log('Navigating to stats page...')
  await page.goto('http://localhost:5174/stats', { timeout: 15000 })
  await page.waitForLoadState('domcontentloaded')
  await new Promise(r => setTimeout(r, 2000))
  await page.screenshot({ path: path.join(rootDir, 'docs', 'screenshots', 'stats-page.png'), fullPage: false })
  console.log('stats-page.png saved')

  await browser.close()
  dev.kill()
  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
