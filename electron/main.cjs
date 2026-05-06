const { app, BrowserWindow, Notification, ipcMain, screen } = require('electron');
const path = require('path');

// 保持窗口引用防止被GC回收
let mainWindow = null;
let notificationWindow = null;

// sql.js 数据库实例（主进程中运行）
let db = null;

// 初始化 sql.js 数据库
async function initDatabase() {
  try {
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();

    // 创建数据库实例
    db = new SQL.Database();

    // 创建 sessions 表
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        started_at TEXT NOT NULL,
        duration INTEGER NOT NULL,
        type TEXT NOT NULL
      )
    `);

    // 创建索引
    db.run(`
      CREATE INDEX IF NOT EXISTS idx_started_at ON sessions(started_at)
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500,
    backgroundColor: '#030712',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 开发环境检测：优先尝试连接 Vite dev server
  // 由于 Electron 主进程不读取 Vite 的环境变量，我们通过尝试连接来检测
  const ports = [5173, 5174, 5175, 5176, 5177];
  const loadWithRetry = (index) => {
    if (index >= ports.length) {
      // 所有端口都失败了，加载生产版本
      console.log('Dev server not available, loading production build');
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      return;
    }
    const port = ports[index];
    console.log(`Trying to connect to Vite dev server at localhost:${port}...`);
    mainWindow.loadURL(`http://localhost:${port}`)
      .then(() => console.log(`Connected to Vite dev server at port ${port}`))
      .catch(() => {
        console.log(`Port ${port} failed, trying next...`);
        loadWithRetry(index + 1);
      });
  };
  loadWithRetry(0);
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

app.whenReady().then(async () => {
  await initDatabase();
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

// 数据库操作 - 保存会话
ipcMain.handle('db-save-session', (event, { duration, type }) => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    const startedAt = new Date().toISOString();
    db.run(
      'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
      [startedAt, duration, type]
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 数据库操作 - 获取今日统计
ipcMain.handle('db-get-today-stats', () => {
  if (!db) return { count: 0, totalDuration: 0 };

  try {
    const today = new Date().toISOString().split('T')[0];
    const result = db.exec(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration
      FROM sessions
      WHERE type = 'work' AND started_at LIKE '${today}%'
    `);

    if (result.length === 0) {
      return { count: 0, totalDuration: 0 };
    }

    return {
      count: result[0].values[0][0],
      totalDuration: result[0].values[0][1]
    };
  } catch (err) {
    console.error('Error getting today stats:', err);
    return { count: 0, totalDuration: 0 };
  }
});

// 数据库操作 - 获取本周统计
ipcMain.handle('db-get-week-stats', () => {
  if (!db) return [];

  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);

    // 构建本周7天的完整数据
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekData.push({
        date: date.toISOString().split('T')[0],
        count: 0
      });
    }

    // 从数据库查询实际数据
    const weekStart = startOfWeek.toISOString().split('T')[0];
    const result = db.exec(`
      SELECT DATE(started_at) as date, COUNT(*) as count
      FROM sessions
      WHERE type = 'work' AND started_at >= '${weekStart}'
      GROUP BY DATE(started_at)
      ORDER BY date
    `);

    // 填充实际数据
    if (result.length > 0) {
      result[0].values.forEach(([date, count]) => {
        const dayIndex = weekData.findIndex(d => d.date === date);
        if (dayIndex !== -1) {
          weekData[dayIndex].count = count;
        }
      });
    }

    return weekData;
  } catch (err) {
    console.error('Error getting week stats:', err);
    return [];
  }
});

// 数据库操作 - 清除所有数据
ipcMain.handle('db-clear-all', () => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    db.run('DELETE FROM sessions');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 数据库操作 - 生成模拟数据
ipcMain.handle('db-generate-mock-data', () => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    const now = new Date();
    const mockData = [];

    for (let i = 6; i >= 0; i--) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() - i);
      baseDate.setHours(0, 0, 0, 0);
      const count = Math.floor(Math.random() * 8) + 1;

      for (let j = 0; j < count; j++) {
        const sessionDate = new Date(baseDate);
        const hours = Math.floor(Math.random() * 12) + 8;
        const minutes = Math.floor(Math.random() * 60);
        sessionDate.setHours(hours, minutes, 0, 0);
        mockData.push({
          startedAt: sessionDate.toISOString(),
          duration: 25 * 60,
          type: 'work'
        });
      }
    }

    mockData.forEach(session => {
      db.run(
        'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
        [session.startedAt, session.duration, session.type]
      );
    });

    return { success: true, count: mockData.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
