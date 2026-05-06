const { app, BrowserWindow, Notification, ipcMain, screen } = require('electron');
const path = require('path');

// 保持窗口引用防止被GC回收
let mainWindow = null;
let notificationWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    backgroundColor: '#030712',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function createNotificationWindow(message) {
  if (notificationWindow) {
    notificationWindow.close();
  }

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

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
  });

  notificationWindow.loadURL(`data:text/html,<html><body style="margin:0;background:rgba(30,41,59,0.95);border-radius:12px;padding:20px;color:white;font-family:system-ui;text-align:center;">${message}</body></html>`);

  setTimeout(() => {
    if (notificationWindow) {
      notificationWindow.close();
      notificationWindow = null;
    }
  }, 5000);
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理显示通知的IPC
ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.on('show-notification-window', (event, message) => {
  createNotificationWindow(message);
});