import { test, expect } from '@playwright/test';

test.describe('统计页面', () => {
  test.beforeEach(async ({ page }) => {
    // 捕获浏览器控制台日志
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text());
      } else {
        console.log('Browser log:', msg.text());
      }
    });

    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
  });

  test('页面应该正确加载', async ({ page }) => {
    await expect(page.getByText('返回计时器')).toBeVisible();
    await expect(page.getByText('今日完成')).toBeVisible();
    await expect(page.getByText('本周趋势')).toBeVisible();
  });

  test('模拟数据按钮应该生成数据并更新显示', async ({ page }) => {
    // 点击模拟数据按钮
    await page.getByRole('button', { name: '模拟数据' }).click();

    // 等待数据更新
    await page.waitForTimeout(1000);

    // 验证数据已更新（今日完成计数应该大于0）
    const countElement = page.locator('.text-primary').first();
    await expect(countElement).not.toHaveText('0');
  });

  test('清除数据按钮应该显示确认弹框', async ({ page }) => {
    await page.getByRole('button', { name: '清除数据' }).click();
    await expect(page.getByRole('heading', { name: '确认清除' })).toBeVisible();
    await expect(page.getByText('确定要清除所有统计数据吗？此操作不可恢复。')).toBeVisible();
    await expect(page.getByRole('button', { name: '取消' })).toBeVisible();
    await expect(page.getByRole('button', { name: '确认清除' })).toBeVisible();
  });

  test('取消按钮应该关闭确认弹框', async ({ page }) => {
    await page.getByRole('button', { name: '清除数据' }).click();
    await expect(page.getByRole('heading', { name: '确认清除' })).toBeVisible();
    await page.getByRole('button', { name: '取消' }).click();
    await expect(page.getByRole('heading', { name: '确认清除' })).not.toBeVisible();
  });

  test('确认清除应该清空数据', async ({ page }) => {
    await page.getByRole('button', { name: '模拟数据' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '清除数据' }).click();
    await page.getByRole('button', { name: '确认清除' }).click();
    await page.waitForTimeout(1000);
    const countElement = page.locator('.text-primary').first();
    await expect(countElement).toHaveText('0');
  });

  test('返回按钮应该跳转到计时器页面', async ({ page }) => {
    await page.getByText('返回计时器').click();
    await expect(page).toHaveURL('/');
  });
});
