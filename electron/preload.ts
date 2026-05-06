import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露给渲染进程的 API
 * 通过 contextBridge 将 Electron 主进程的 IPC 方法暴露给 React 前端
 * 这样可以在不启用 nodeIntegration 的情况下安全地调用主进程功能
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 显示系统通知
   * @param title 通知标题
   * @param body 通知正文
   */
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body })
  },

  /**
   * 显示桌面浮窗通知
   * @param message 要显示的消息内容
   */
  showNotificationWindow: (message: string) => {
    ipcRenderer.send('show-notification-window', message)
  },

  /**
   * 保存番茄钟会话记录
   * @param duration 持续时长（秒）
   * @param type 会话类型（'work' | 'shortBreak' | 'longBreak'）
   */
  saveSession: (duration: number, type: string) => {
    return ipcRenderer.invoke('db-save-session', { duration, type })
  },

  /**
   * 获取今日统计数据
   * @returns 包含今日完成数和总时长的对象
   */
  getTodayStats: () => {
    return ipcRenderer.invoke('db-get-today-stats')
  },

  /**
   * 获取本周统计数据
   * @returns 包含本周每天完成数和连续天数等信息的对象
   */
  getWeekStats: () => {
    return ipcRenderer.invoke('db-get-week-stats')
  },

  /**
   * 清除所有会话数据
   * @returns 操作结果
   */
  clearAllData: () => {
    return ipcRenderer.invoke('db-clear-all')
  },

  /**
   * 生成模拟数据（用于开发和测试）
   * @returns 操作结果和生成的数据条数
   */
  generateMockData: () => {
    return ipcRenderer.invoke('db-generate-mock-data')
  }
})