import { app, BrowserWindow, Notification, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import http from 'http'
import { Database } from './database'

// 用于加载 Node.js 内置模块（esbuild 打包后 require 被包装，需要用 createRequire）
const require = createRequire(import.meta.url)

// ESM 模块中手动定义 __dirname（ESM 没有这个变量）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 保持窗口引用防止被 GC 回收
let mainWindow: BrowserWindow | null = null
let notificationWindow: BrowserWindow | null = null
let tray: Tray | null = null

// 用于判断是否是用户主动退出（而不是被系统关闭）
let isQuitting = false

// sql.js 数据库实例（运行在主进程中，持久化到文件）
const db = new Database(path.join(app.getPath('userData'), 'tomato-clock.db'))

// 本地 HTTP 服务器实例（用于解决 file:// 协议的中文路径问题）
let server: http.Server | null = null

// 获取应用图标路径（兼容开发和打包模式）
function getIconPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', 'icon.png')
  }
  return path.join(__dirname, '..', 'build', 'icon.png')
}

/**
 * 创建主窗口
 * 番茄钟应用的主界面窗口，固定 400x600 大小
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,    // 最小宽度防止内容被压缩
    minHeight: 500,    // 最小高度确保计时器显示完整
    backgroundColor: '#030712', // 深色背景与主题一致
    autoHideMenuBar: true,       // 隐藏菜单栏（快捷键不受影响）
    icon: getIconPath(),
    skipTaskbar: true,           // 隐藏任务栏图标
    show: false,                  // 启动时隐藏，等待 ready-to-show 再显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 预加载脚本路径
      contextIsolation: true,    // 启用上下文隔离（安全）
      nodeIntegration: false     // 禁用 Node.js 集成（安全）
    }
  })

  // 窗口准备好后显示（避免启动时闪烁）
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 拦截窗口关闭事件，隐藏而非退出
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // 使用 path.resolve 而非 path.join，避免中文路径导致 dist 路径错误
  // path.join('C:\\文档\\Code\\projects\\dist-electron', '../dist')
  // 会变成 'C:文档Codeprojectsdist' 而不是 'C:\文档\Code\projects\dist'
  const distPath = path.resolve(__dirname, '..', 'dist')

  // 创建本地 HTTP 服务器来服务 dist 文件夹
  // 这样可以解决 Electron 的 file:// 协议无法处理绝对路径（/assets/...）的问题
  server = http.createServer((req, res) => {
    // req.url 可能是 undefined，默认使用 '/'
    const requestPath = req.url || '/'

    // 根据请求路径拼接实际文件路径
    // 注意：在 Windows 上 path.join 会把以 / 开头的路径当作绝对路径处理
    // 所以需要把请求路径的前导 / 去掉
    let filePath = path.join(distPath, requestPath === '/' ? 'index.html' : requestPath.replace(/^\//, ''))
    console.log(`[HTTP] ${requestPath} -> ${filePath}`)

    const ext = path.extname(filePath)

    // MIME 类型映射，确保浏览器正确解析资源
    const contentTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml'
    }

    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain')
    res.setHeader('Access-Control-Allow-Origin', '*') //允许跨域（开发时有用）

    try {
      const content = require('fs').readFileSync(filePath)
      res.end(content)
    } catch (e) {
      // 文件不存在时返回 404
      const err = e as Error
      console.log(`[HTTP] 404: ${filePath} - ${err.message}`)
      res.statusCode = 404
      res.end('Not found')
    }
  })

  // 监听 3847 端口（选择原则：避开常用端口，且不容易被其他应用占用）
  server.listen(3847, '127.0.0.1', () => {
    console.log('本地服务器已启动: http://127.0.0.1:3847')
    // 窗口加载完成后显示生产版本
    mainWindow?.loadURL('http://127.0.0.1:3847')
      .then(() => console.log('生产版本加载成功'))
      .catch(err => console.error('加载失败:', err))
  })
}

/**
 * 创建通知窗口
 * 用于在桌面右上角显示计时器完成的浮窗通知
 */
function createNotificationWindow(message: string) {
  // 关闭已存在的通知窗口（防止多个通知堆积）
  if (notificationWindow) {
    notificationWindow.close()
  }

  // 获取主显示器尺寸，用于计算窗口位置
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

  // 创建无边框、透明、始终置顶的小窗口
  notificationWindow = new BrowserWindow({
    width: 200,
    height: 80,
    frame: false,       // 无窗口边框
    transparent: true,   // 透明背景
    alwaysOnTop: true,   // 始终置顶
    skipTaskbar: true,   // 不显示在任务栏
    resizable: false,    // 禁止调整大小
    x: screenWidth - 220, // 右上角（屏幕宽度 - 窗口宽度 - 边距）
    y: 20                // 距离顶部 20px
  })

  // 使用 data URL 直接加载 HTML 内容（简单场景下的常用做法）
  notificationWindow.loadURL(
    `data:text/html,<html><body style="margin:0;background:rgba(30,41,59,0.95);border-radius:12px;padding:20px;color:white;font-family:system-ui;text-align:center;">${message}</body></html>`
  )

  // 5 秒后自动关闭通知窗口
  setTimeout(() => {
    if (notificationWindow) {
      notificationWindow.close()
      notificationWindow = null
    }
  }, 5000)
}

/**
 * 创建系统托盘
 * 用于在 Windows 通知区域显示应用图标，提供快速访问菜单
 */
function createTray() {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)

  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('番茄钟')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: '隐藏窗口',
      click: () => {
        mainWindow?.hide()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // 点击托盘图标：显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

// 应用准备就绪时（Electron 启动完成后）
app.whenReady().then(async () => {
  // 初始化 sql.js 数据库（异步操作）
  await db.init()

  // 创建系统托盘
  createTray()

  // 创建主窗口
  createMainWindow()

  // macOS 特性：当 dock 图标被点击且没有窗口时，重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// 所有窗口关闭时（macOS 除外）
app.on('window-all-closed', () => {
  // 关闭本地 HTTP 服务器
  if (server) server.close()

  // 非 macOS 系统退出应用
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出前（所有平台都会触发）
app.on('before-quit', () => {
  isQuitting = true
  db.close()
})

// IPC 处理器：显示系统通知
ipcMain.on('show-notification', (_, { title, body }: { title: string; body: string }) => {
  // 先检查系统是否支持通知（某些 Linux 发行版可能不支持）
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})

// IPC 处理器：显示浮窗通知
ipcMain.on('show-notification-window', (_, message: string) => {
  createNotificationWindow(message)
})

// IPC 处理器：保存番茄钟会话记录
ipcMain.handle(
  'db-save-session',
  (_, { duration, type }: { duration: number; type: string }) => {
    return db.saveSession(duration, type)
  }
)

// IPC 处理器：获取今日统计数据
ipcMain.handle('db-get-today-stats', () => {
  return db.getTodayStats()
})

// IPC 处理器：获取本周统计数据
ipcMain.handle('db-get-week-stats', () => {
  return db.getWeekStats()
})

// IPC 处理器：清除所有数据
ipcMain.handle('db-clear-all', () => {
  return db.clearAll()
})

// IPC 处理器：生成模拟数据（用于测试）
ipcMain.handle('db-generate-mock-data', () => {
  return db.generateMockData()
})