import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import type { SessionType } from '@/types/timer'

/**
 * 数据库上下文值类型
 */
interface DatabaseContextValue {
  /** 数据版本号（用于触发重新渲染） */
  dataVersion: number
  /** 保存一次番茄钟会话 */
  saveSession: (duration: number, type: SessionType) => Promise<{ success: boolean; error?: string }>
  /** 获取今日统计数据 */
  getTodayStats: () => Promise<{ completedToday: number; streakDays: number }>
  /** 获取本周统计数据 */
  getWeekStats: () => Promise<{
    days: Array<{ date: string; completed: number }>
    totalWorkMinutes: number
    averageWorkMinutes: number
    streakDays: number
  }>
  /** 清除所有数据 */
  clearAllData: () => Promise<{ success: boolean; error?: string }>
  /** 生成模拟数据（用于测试） */
  generateMockData: () => Promise<{ success: boolean; error?: string }>
}

// 创建数据库上下文
const DatabaseContext = createContext<DatabaseContextValue | null>(null)

/**
 * 数据库 Provider Props
 */
interface DatabaseProviderProps {
  children: ReactNode
}

/**
 * 数据库 Provider 组件
 * 提供数据库操作给子组件，通过 Context 传递
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  // 数据版本号，变更时触发使用该数据的组件重新渲染
  const [dataVersion, setDataVersion] = useState(0)

  /**
   * 保存会话并更新版本号
   */
  const saveSession = useCallback(async (duration: number, type: SessionType) => {
    const result = await window.electronAPI.saveSession(duration, type)
    if (result.success) {
      setDataVersion((v) => v + 1)
    }
    return result
  }, [])

  /**
   * 获取今日统计（依赖 dataVersion 以在数据变化时刷新）
   */
  const getTodayStats = useCallback(async () => {
    return await window.electronAPI.getTodayStats()
  }, [dataVersion])

  /**
   * 获取本周统计
   */
  const getWeekStats = useCallback(async () => {
    return await window.electronAPI.getWeekStats()
  }, [dataVersion])

  /**
   * 清除所有数据
   */
  const clearAllData = useCallback(async () => {
    const result = await window.electronAPI.clearAllData()
    if (result.success) {
      setDataVersion((v) => v + 1)
    }
    return result
  }, [])

  /**
   * 生成模拟数据
   */
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

/**
 * 使用数据库上下文
 * @throws 如果不在 DatabaseProvider 内调用
 */
export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase 必须在 DatabaseProvider 内使用')
  }
  return context
}