import { useState, useCallback, createContext, useContext } from 'react';

// 创建 Database Context
const DatabaseContext = createContext(null);

/**
 * Database Provider - 在应用顶层共享数据库操作
 */
export function DatabaseProvider({ children }) {
  const [dataVersion, setDataVersion] = useState(0);

  // 保存番茄会话
  const saveSession = useCallback(async (duration, type) => {
    const result = await window.electronAPI.saveSession(duration, type);
    if (result.success) {
      setDataVersion(v => v + 1);
    }
    return result;
  }, []);

  // 获取今日统计
  const getTodayStats = useCallback(async () => {
    return await window.electronAPI.getTodayStats();
  }, [dataVersion]);

  // 获取本周统计
  const getWeekStats = useCallback(async () => {
    return await window.electronAPI.getWeekStats();
  }, [dataVersion]);

  // 清除所有数据
  const clearAllData = useCallback(async () => {
    const result = await window.electronAPI.clearAllData();
    if (result.success) {
      setDataVersion(v => v + 1);
    }
    return result;
  }, []);

  // 生成模拟数据（用于测试）
  const generateMockData = useCallback(async () => {
    const result = await window.electronAPI.generateMockData();
    if (result.success) {
      setDataVersion(v => v + 1);
    }
    return result;
  }, []);

  const value = {
    dataVersion,
    saveSession,
    getTodayStats,
    getWeekStats,
    clearAllData,
    generateMockData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * 数据库 Hook
 * 使用 Context 共享数据库操作
 */
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
