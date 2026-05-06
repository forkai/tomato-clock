import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import type { SessionType } from '@/types/timer'

interface DatabaseContextValue {
  dataVersion: number
  saveSession: (duration: number, type: SessionType) => Promise<{ success: boolean; error?: string }>
  getTodayStats: () => Promise<{ completedToday: number; streakDays: number }>
  getWeekStats: () => Promise<{
    days: Array<{ date: string; completed: number }>
    totalWorkMinutes: number
    averageWorkMinutes: number
    streakDays: number
  }>
  clearAllData: () => Promise<{ success: boolean; error?: string }>
  generateMockData: () => Promise<{ success: boolean; error?: string }>
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null)

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [dataVersion, setDataVersion] = useState(0)

  const saveSession = useCallback(async (duration: number, type: SessionType) => {
    const result = await window.electronAPI.saveSession(duration, type)
    if (result.success) {
      setDataVersion((v) => v + 1)
    }
    return result
  }, [])

  const getTodayStats = useCallback(async () => {
    return await window.electronAPI.getTodayStats()
  }, [dataVersion])

  const getWeekStats = useCallback(async () => {
    return await window.electronAPI.getWeekStats()
  }, [dataVersion])

  const clearAllData = useCallback(async () => {
    const result = await window.electronAPI.clearAllData()
    if (result.success) {
      setDataVersion((v) => v + 1)
    }
    return result
  }, [])

  const generateMockData = useCallback(async () => {
    const result = await window.electronAPI.generateMockData()
    if (result.success) {
      setDataVersion((v) => v + 1)
    }
    return result
  }, [])

  const value: DatabaseContextValue = {
    dataVersion,
    saveSession,
    getTodayStats,
    getWeekStats,
    clearAllData,
    generateMockData
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}
