import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body })
  },
  showNotificationWindow: (message: string) => {
    ipcRenderer.send('show-notification-window', message)
  },
  saveSession: (duration: number, type: string) => {
    return ipcRenderer.invoke('db-save-session', { duration, type })
  },
  getTodayStats: () => {
    return ipcRenderer.invoke('db-get-today-stats')
  },
  getWeekStats: () => {
    return ipcRenderer.invoke('db-get-week-stats')
  },
  clearAllData: () => {
    return ipcRenderer.invoke('db-clear-all')
  },
  generateMockData: () => {
    return ipcRenderer.invoke('db-generate-mock-data')
  }
})
