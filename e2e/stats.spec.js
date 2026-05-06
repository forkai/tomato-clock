import { test, expect } from '@playwright/test';

// E2E 测试的 mock electronAPI（在浏览器上下文中运行）
const mockElectronAPI = `
(function() {
  console.log('[Mock] Setting up electronAPI mock');
  let mockState = {
    today: { count: 0, totalDuration: 0 },
    week: []
  };

  window.electronAPI = {
    saveSession: async (duration, type) => {
      mockState.today.count++;
      mockState.today.totalDuration += duration;
      return { success: true };
    },
    getTodayStats: async () => {
      console.log('[Mock] getTodayStats called, returning:', JSON.stringify(mockState.today));
      return { ...mockState.today };
    },
    getWeekStats: async () => {
      console.log('[Mock] getWeekStats called, returning:', JSON.stringify(mockState.week));
      return [...mockState.week];
    },
    clearAllData: async () => {
      console.log('[Mock] clearAllData called');
      mockState = { today: { count: 0, totalDuration: 0 }, week: [] };
      return { success: true };
    },
    generateMockData: async () => {
      console.log('[Mock] generateMockData called');
      mockState.today = { count: 5, totalDuration: 7500 };
      mockState.week = [
        { date: '2026-05-01', count: 3 },
        { date: '2026-05-02', count: 5 },
        { date: '2026-05-03', count: 2 },
        { date: '2026-05-04', count: 4 },
        { date: '2026-05-05', count: 6 },
        { date: '2026-05-06', count: 3 },
        { date: '2026-05-07', count: 5 }
      ];
      return { success: true, count: 33 };
    },
    showNotification: () => { console.log('[Mock] showNotification'); },
    showNotificationWindow: () => { console.log('[Mock] showNotificationWindow'); }
  };
  console.log('[Mock] electronAPI mock setup complete');
})();
`;

test.describe('统计页面', () => {
  test('页面应该正确加载', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('返回计时器')).toBeVisible();
    await expect(page.getByText('今日完成')).toBeVisible();
    await expect(page.getByText('本周趋势')).toBeVisible();
  });

  test('模拟数据按钮应该生成数据', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    // 注入 mock
    await page.addScriptTag({ content: mockElectronAPI });

    // 验证初始状态
    const initialStats = await page.evaluate(async () => {
      return await window.electronAPI.getTodayStats();
    });
    console.log('Initial stats:', initialStats);

    // 点击模拟数据按钮
    await page.getByRole('button', { name: '模拟数据' }).click();

    // 等待一下
    await page.waitForTimeout(500);

    // 验证数据已更新
    const updatedStats = await page.evaluate(async () => {
      return await window.electronAPI.getTodayStats();
    });
    console.log('Updated stats:', updatedStats);
    expect(updatedStats.count).toBeGreaterThan(0);
  });

  test('清除数据按钮应该显示确认弹框', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '清除数据' }).click();
    await expect(page.getByRole('heading', { name: '确认清除' })).toBeVisible();
    await expect(page.getByText('确定要清除所有统计数据吗？此操作不可恢复。')).toBeVisible();
    await expect(page.getByRole('button', { name: '取消' })).toBeVisible();
    await expect(page.getByRole('button', { name: '确认' })).toBeVisible();
  });

  test('取消按钮应该关闭确认弹框', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: '清除数据' }).click();
    await expect(page.getByRole('heading', { name: '确认清除' })).toBeVisible();
    await page.getByRole('button', { name: '取消' }).click();
    await expect(page.getByRole('heading', { name: '确认清除' })).not.toBeVisible();
  });

  test('确认清除应该清空数据', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    // 注入 mock 并设置有数据状态
    await page.addScriptTag({ content: mockElectronAPI });
    await page.evaluate(async () => {
      await window.electronAPI.generateMockData();
    });

    // 验证有数据
    const statsBefore = await page.evaluate(async () => {
      return await window.electronAPI.getTodayStats();
    });
    expect(statsBefore.count).toBe(5);

    // 点击清除数据按钮
    await page.getByRole('button', { name: '清除数据' }).click();
    await page.getByRole('button', { name: '确认' }).click();

    // 等待一下
    await page.waitForTimeout(500);

    // 验证数据已清空
    const statsAfter = await page.evaluate(async () => {
      return await window.electronAPI.getTodayStats();
    });
    expect(statsAfter.count).toBe(0);
  });

  test('返回按钮应该跳转到计时器页面', async ({ page }) => {
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');

    await page.getByText('返回计时器').click();
    await expect(page).toHaveURL('/');
  });
});