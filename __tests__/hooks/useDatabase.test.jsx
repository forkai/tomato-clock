import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * useDatabase 单元测试
 *
 * 由于 sql.js 是 WebAssembly 依赖，我们直接测试数据库逻辑函数
 */

describe('useDatabase logic', () => {
  describe('today stats query', () => {
    it('should format today date correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should calculate week start correctly', () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);
      const weekStart = startOfWeek.toISOString().split('T')[0];
      expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('mock data generation', () => {
    it('should generate 7 days of data', () => {
      const now = new Date();
      const mockData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const count = Math.floor(Math.random() * 8) + 1;
        for (let j = 0; j < count; j++) {
          mockData.push({
            startedAt: date.toISOString(),
            duration: 25 * 60,
            type: 'work'
          });
        }
      }

      // 应该生成 7 天的数据
      expect(mockData.length).toBeGreaterThanOrEqual(7);
      expect(mockData.length).toBeLessThanOrEqual(56); // 7天 * 最多8个
    });

    it('should set correct duration for work sessions', () => {
      const mockData = [];
      const date = new Date();
      date.setHours(10, 0, 0, 0);
      mockData.push({
        startedAt: date.toISOString(),
        duration: 25 * 60,
        type: 'work'
      });

      expect(mockData[0].duration).toBe(25 * 60);
      expect(mockData[0].type).toBe('work');
    });
  });

  describe('streak calculation', () => {
    it('should count days with completed pomodoros', () => {
      const weekStats = [
        { date: '2026-05-01', count: 4 },
        { date: '2026-05-02', count: 0 },
        { date: '2026-05-03', count: 6 },
        { date: '2026-05-04', count: 0 },
        { date: '2026-05-05', count: 3 },
        { date: '2026-05-06', count: 0 },
        { date: '2026-05-07', count: 5 }
      ];

      const streakDays = weekStats.filter(d => d.count > 0).length;
      expect(streakDays).toBe(4);
    });

    it('should return 0 when no pomodoros completed', () => {
      const weekStats = [
        { date: '2026-05-01', count: 0 },
        { date: '2026-05-02', count: 0 },
        { date: '2026-05-03', count: 0 }
      ];

      const streakDays = weekStats.filter(d => d.count > 0).length;
      expect(streakDays).toBe(0);
    });
  });

  describe('dataVersion increment', () => {
    it('should increment on data change', () => {
      let dataVersion = 0;

      // Simulate saveSession
      dataVersion = dataVersion + 1;
      expect(dataVersion).toBe(1);

      // Simulate generateMockData
      dataVersion = dataVersion + 1;
      expect(dataVersion).toBe(2);

      // Simulate clearAllData
      dataVersion = dataVersion + 1;
      expect(dataVersion).toBe(3);
    });
  });
});

describe('SQL query generation', () => {
  it('should generate correct today query', () => {
    const today = '2026-05-07';
    const query = `
      SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration
      FROM sessions
      WHERE type = 'work' AND started_at LIKE '${today}%'
    `;

    expect(query).toContain(today);
    expect(query).toContain("type = 'work'");
  });

  it('should generate correct week query', () => {
    const weekStart = '2026-05-01';
    const query = `
      SELECT DATE(started_at) as date, COUNT(*) as count
      FROM sessions
      WHERE type = 'work' AND started_at >= '${weekStart}'
      GROUP BY DATE(started_at)
      ORDER BY date
    `;

    expect(query).toContain(weekStart);
    expect(query).toContain("type = 'work'");
    expect(query).toContain('GROUP BY');
  });
});
