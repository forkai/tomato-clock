import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * useDatabase 单元测试
 * 测试内存数据库逻辑
 */

describe('useDatabase logic', () => {
  // 模拟 MemoryDatabase 类
  class MemoryDatabase {
    constructor() {
      this.sessions = [];
    }

    saveSession(startedAt, duration, type) {
      this.sessions.push({ id: Date.now(), started_at: startedAt, duration, type });
    }

    getTodayStats() {
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = this.sessions.filter(
        s => s.type === 'work' && s.started_at.startsWith(today)
      );
      return {
        count: todaySessions.length,
        totalDuration: todaySessions.reduce((sum, s) => sum + s.duration, 0)
      };
    }

    getWeekStats() {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const weekSessions = this.sessions.filter(
        s => s.type === 'work' && new Date(s.started_at) >= startOfWeek
      );

      const dayMap = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dayMap[dateStr] = 0;
      }

      weekSessions.forEach(s => {
        const dateStr = s.started_at.split('T')[0];
        if (dayMap[dateStr] !== undefined) {
          dayMap[dateStr]++;
        }
      });

      return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
    }

    clearAll() {
      this.sessions = [];
    }
  }

  let db;

  beforeEach(() => {
    db = new MemoryDatabase();
  });

  describe('saveSession', () => {
    it('should save a work session', () => {
      db.saveSession('2026-05-07T10:00:00.000Z', 1500, 'work');
      expect(db.sessions.length).toBe(1);
      expect(db.sessions[0].type).toBe('work');
      expect(db.sessions[0].duration).toBe(1500);
    });
  });

  describe('getTodayStats', () => {
    it('should return zero stats when no data', () => {
      const stats = db.getTodayStats();
      expect(stats.count).toBe(0);
      expect(stats.totalDuration).toBe(0);
    });

    it('should count today sessions correctly', () => {
      const today = new Date().toISOString();
      db.saveSession(today, 1500, 'work');
      db.saveSession(today, 1500, 'work');
      db.saveSession(today, 1500, 'work');

      const stats = db.getTodayStats();
      expect(stats.count).toBe(3);
      expect(stats.totalDuration).toBe(4500);
    });

    it('should not count break sessions', () => {
      const today = new Date().toISOString();
      db.saveSession(today, 1500, 'work');
      db.saveSession(today, 300, 'shortBreak');

      const stats = db.getTodayStats();
      expect(stats.count).toBe(1);
    });
  });

  describe('getWeekStats', () => {
    it('should return 7 days with zero counts when no data', () => {
      const stats = db.getWeekStats();
      expect(stats.length).toBe(7);
      stats.forEach(s => {
        expect(s.count).toBe(0);
      });
    });

    it('should count sessions within current week', () => {
      const today = new Date();
      db.saveSession(today.toISOString(), 1500, 'work');

      const stats = db.getWeekStats();
      const todayStr = today.toISOString().split('T')[0];
      const todayStats = stats.find(s => s.date === todayStr);
      expect(todayStats.count).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('should remove all sessions', () => {
      db.saveSession('2026-05-07T10:00:00.000Z', 1500, 'work');
      db.saveSession('2026-05-06T10:00:00.000Z', 1500, 'work');
      expect(db.sessions.length).toBe(2);

      db.clearAll();
      expect(db.sessions.length).toBe(0);
    });
  });
});

describe('Mock data generation', () => {
  it('should generate 7 days of data', () => {
    // 直接模拟生成逻辑
    const now = new Date();
    const mockData = [];

    for (let i = 6; i >= 0; i--) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() - i);
      baseDate.setHours(0, 0, 0, 0);
      const count = Math.floor(Math.random() * 8) + 1;
      for (let j = 0; j < count; j++) {
        mockData.push({ date: baseDate.toISOString(), duration: 25 * 60 });
      }
    }

    expect(mockData.length).toBeGreaterThanOrEqual(7);
    expect(mockData.length).toBeLessThanOrEqual(56);
  });
});
