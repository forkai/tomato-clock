import * as esbuild from 'esbuild'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// 确保 dist-electron 目录存在
const outDir = join(rootDir, 'dist-electron')
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true })
}

// 构建 main.ts
await esbuild.build({
  entryPoints: [join(rootDir, 'electron/main.ts')],
  bundle: true,
  platform: 'node',
  outfile: join(outDir, 'main.js'),
  external: ['electron', 'sql.js'],
  format: 'esm',
  target: 'node18'
})

// 构建 preload.ts
await esbuild.build({
  entryPoints: [join(rootDir, 'electron/preload.ts')],
  bundle: true,
  platform: 'node',
  outfile: join(outDir, 'preload.js'),
  external: ['electron'],
  format: 'cjs',
  target: 'node18'
})

console.log('Electron build completed')
