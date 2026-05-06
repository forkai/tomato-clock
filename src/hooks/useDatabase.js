import { useState, useEffect, useCallback } from 'react';
import initSqlJs from 'sql.js';

/**
 * 数据库 Hook
 * 封装 sql.js 的初始化和基本操作
 */
export function useDatabase() {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化数据库
  useEffect(() => {
    async function initDB() {
      try {
        // 初始化 sql.js
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });

        // 创建数据库实例
        const database = new SQL.Database();

        // 创建 sessions 表
        database.run(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at TEXT NOT NULL,
            duration INTEGER NOT NULL,
            type TEXT NOT NULL
          )
        `);

        // 创建索引
        database.run(`
          CREATE INDEX IF NOT EXISTS idx_started_at ON sessions(started_at)
        `);

        setDb(database);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    }

    initDB();

    // 清理
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // 保存番茄会话
  const saveSession = useCallback((duration, type) => {
    if (!db) return;

    const startedAt = new Date().toISOString();
    db.run(
      'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
      [startedAt, duration, type]
    );
  }, [db]);

  // 获取今日统计
  const getTodayStats = useCallback(() => {
    if (!db) return { count: 0, totalDuration: 0 };

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
  }, [db]);

  // 获取本周统计
  const getWeekStats = useCallback(() => {
    if (!db) return [];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const result = db.exec(`
      SELECT DATE(started_at) as date, COUNT(*) as count
      FROM sessions
      WHERE type = 'work' AND started_at >= '${weekStart}'
      GROUP BY DATE(started_at)
      ORDER BY date
    `);

    if (result.length === 0) return [];

    return result[0].values.map(([date, count]) => ({ date, count }));
  }, [db]);

  // 清除所有数据
  const clearAllData = useCallback(() => {
    if (!db) return;
    db.run('DELETE FROM sessions');
  }, [db]);

  // 生成模拟数据（用于测试）
  const generateMockData = useCallback(() => {
    if (!db) return;

    const now = new Date();
    const mockData = [];

    // 生成过去7天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const count = Math.floor(Math.random() * 8) + 1; // 1-8个番茄
      for (let j = 0; j < count; j++) {
        const hours = Math.floor(Math.random() * 12) + 8; // 8点到20点
        const minutes = Math.floor(Math.random() * 60);
        date.setHours(hours, minutes, 0, 0);
        mockData.push({
          startedAt: date.toISOString(),
          duration: 25 * 60, // 25分钟
          type: 'work'
        });
      }
    }

    // 批量插入
    mockData.forEach(session => {
      db.run(
        'INSERT INTO sessions (started_at, duration, type) VALUES (?, ?, ?)',
        [session.startedAt, session.duration, session.type]
      );
    });
  }, [db]);

  return {
    db,
    isLoading,
    error,
    saveSession,
    getTodayStats,
    getWeekStats,
    clearAllData,
    generateMockData
  };
}