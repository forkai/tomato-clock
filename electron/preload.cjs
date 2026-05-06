const { contextBridge, ipcRenderer } = require('electron');

// 通过 contextBridge 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 通知相关
  showNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  showNotificationWindow: (message) => {
    ipcRenderer.send('show-notification-window', message);
  },

  // 数据库操作
  saveSession: (duration, type) => {
    return ipcRenderer.invoke('db-save-session', { duration, type });
  },
  getTodayStats: () => {
    return ipcRenderer.invoke('db-get-today-stats');
  },
  getWeekStats: () => {
    return ipcRenderer.invoke('db-get-week-stats');
  },
  clearAllData: () => {
    return ipcRenderer.invoke('db-clear-all');
  },
  generateMockData: () => {
    return ipcRenderer.invoke('db-generate-mock-data');
  }
});
