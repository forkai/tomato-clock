/**
 * 清理 Electron 多余的 locale 文件，减小打包体积
 * 只保留 zh-CN 和 zh-TW（中文）
 */
import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const electronDist = 'node_modules/electron/dist'
const localesPath = join(electronDist, 'locales')

async function cleanup() {
  try {
    const files = await readdir(localesPath)
    const toKeep = ['zh-CN.pak', 'zh-TW.pak']

    let freedSpace = 0
    for (const file of files) {
      if (!toKeep.includes(file)) {
        const filePath = join(localesPath, file)
        const stat = await rm(filePath, { dryRun: false })
        freedSpace += 0 // 简化，不计算了
        console.log(`Removed: ${file}`)
      }
    }
    console.log('Locale cleanup completed.')
  } catch (err) {
    console.error('Cleanup error:', err.message)
  }
}

cleanup()
