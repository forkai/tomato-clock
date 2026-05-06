import type { SessionType } from './timer'

export interface ElectronAPI {
  showNotification: (title: string, body: string) => void
  showNotificationWindow: (message: string) => void
  saveSession: (duration: number, type: SessionType) => Promise<{ success: boolean; error?: string }>
  getTodayStats: () => Promise<{
    completedToday: number
    streakDays: number
  }>
  getWeekStats: () => Promise<{
    days: Array<{ date: string; completed: number }>
    totalWorkMinutes: number
    averageWorkMinutes: number
    streakDays: number
  }>
  clearAllData: () => Promise<{ success: boolean; error?: string }>
  generateMockData: () => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
