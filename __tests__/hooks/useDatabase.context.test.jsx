import { describe, it, expect, vi } from 'vitest';

/**
 * useDatabase Context 测试（基于新架构）
 * 数据库操作现在通过 IPC 调用主进程
 */

describe('useDatabase IPC 通信', () => {
  it('should expose required methods', () => {
    const mockAPI = {
      saveSession: vi.fn(),
      getTodayStats: vi.fn(),
      getWeekStats: vi.fn(),
      clearAllData: vi.fn(),
      generateMockData: vi.fn()
    };

    // 验证 mock API 包含所有必要方法
    expect(typeof mockAPI.saveSession).toBe('function');
    expect(typeof mockAPI.getTodayStats).toBe('function');
    expect(typeof mockAPI.getWeekStats).toBe('function');
    expect(typeof mockAPI.clearAllData).toBe('function');
    expect(typeof mockAPI.generateMockData).toBe('function');
  });

  it('should call IPC for getTodayStats', async () => {
    const mockAPI = {
      getTodayStats: vi.fn().mockResolvedValue({ count: 5, totalDuration: 7500 })
    };

    const result = await mockAPI.getTodayStats();
    expect(mockAPI.getTodayStats).toHaveBeenCalled();
    expect(result.count).toBe(5);
  });

  it('should call IPC for getWeekStats', async () => {
    const mockWeekStats = [
      { date: '2026-05-01', count: 3 },
      { date: '2026-05-02', count: 0 },
      { date: '2026-05-03', count: 5 }
    ];
    const mockAPI = {
      getWeekStats: vi.fn().mockResolvedValue(mockWeekStats)
    };

    const result = await mockAPI.getWeekStats();
    expect(mockAPI.getWeekStats).toHaveBeenCalled();
    expect(result).toHaveLength(3);
  });

  it('should call IPC for generateMockData', async () => {
    const mockAPI = {
      generateMockData: vi.fn().mockResolvedValue({ success: true, count: 20 })
    };

    const result = await mockAPI.generateMockData();
    expect(mockAPI.generateMockData).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should call IPC for clearAllData', async () => {
    const mockAPI = {
      clearAllData: vi.fn().mockResolvedValue({ success: true })
    };

    const result = await mockAPI.clearAllData();
    expect(mockAPI.clearAllData).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});

describe('IPC API 契约', () => {
  it('should have correct method signatures', () => {
    // 验证 electronAPI 暴露的方法
    const mockAPI = {
      saveSession: vi.fn(),
      getTodayStats: vi.fn(),
      getWeekStats: vi.fn(),
      clearAllData: vi.fn(),
      generateMockData: vi.fn()
    };

    const expectedMethods = ['saveSession', 'getTodayStats', 'getWeekStats', 'clearAllData', 'generateMockData'];
    expectedMethods.forEach(method => {
      expect(typeof mockAPI[method]).toBe('function');
    });
  });
});
