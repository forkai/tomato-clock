import { app, BrowserWindow, Notification, ipcMain, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { Database } from './database'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let notificationWindow: BrowserWindow | null = null
const db = new Database()

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    backgroundColor: '#030712',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 使用 file:// URL 让相对路径能正确解析
  const prodPath = path.join(__dirname, '../dist/index.html')
  const fileUrl = `file://${prodPath.replace(/\\/g, '/')}`
  console.log('Loading via file URL:', fileUrl)
  mainWindow.loadURL(fileUrl)
    .then(() => console.log('Production build loaded successfully'))
    .catch(err => {
      console.error('Failed to load production build:', err)
    })
}

function createNotificationWindow(message: string) {
  if (notificationWindow) {
    notificationWindow.close()
  }

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize

  notificationWindow = new BrowserWindow({
    width: 200,
    height: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    x: screenWidth - 220,
    y: 20
  })

  notificationWindow.loadURL(
    `data:text/html,<html><body style="margin:0;background:rgba(30,41,59,0.95);border-radius:12px;padding:20px;color:white;font-family:system-ui;text-align:center;">${message}</body></html>`
  )

  setTimeout(() => {
    if (notificationWindow) {
      notificationWindow.close()
      notificationWindow = null
    }
  }, 5000)
}

app.whenReady().then(async () => {
  await db.init()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('show-notification', (_, { title, body }: { title: string; body: string }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})

ipcMain.on('show-notification-window', (_, message: string) => {
  createNotificationWindow(message)
})

ipcMain.handle(
  'db-save-session',
  (_, { duration, type }: { duration: number; type: string }) => {
    return db.saveSession(duration, type)
  }
)

ipcMain.handle('db-get-today-stats', () => {
  return db.getTodayStats()
})

ipcMain.handle('db-get-week-stats', () => {
  return db.getWeekStats()
})

ipcMain.handle('db-clear-all', () => {
  return db.clearAll()
})

ipcMain.handle('db-generate-mock-data', () => {
  return db.generateMockData()
})
