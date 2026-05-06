import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/hooks/useDatabase';
import { TodayStats } from '@/components/Stats/TodayStats';
import { WeekStats } from '@/components/Stats/WeekStats';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

/**
 * 统计页面
 * 显示今日统计（包含连续专注天数）、本周趋势
 */
export function StatsPage() {
  const { getTodayStats, getWeekStats, clearAllData, generateMockData, dataVersion } = useDatabase();
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState({ todayStats: { count: 0, totalDuration: 0 }, weekStats: [], streakDays: 0 });

  // 每次 dataVersion 变化时重新获取统计数据
  useEffect(() => {
    async function fetchStats() {
      const today = await getTodayStats();
      const week = await getWeekStats();
      const streak = week.filter(d => d.count > 0).length;
      setStats({ todayStats: today, weekStats: week, streakDays: streak });
    }
    fetchStats();
  }, [dataVersion, getTodayStats, getWeekStats]);

  // 生成模拟数据
  const handleGenerateMockData = async () => {
    await generateMockData();
  };

  // 清除数据
  const handleClearData = async () => {
    await clearAllData();
    setShowConfirm(false);
  };

  return (
    <div className="h-screen bg-background px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
      {/* 顶部栏：返回按钮 + 清除数据按钮 */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
        <Link
          to="/"
          className="p-2 text-foreground/60 hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
          title="返回计时器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex gap-2">
          {/* 模拟数据按钮 */}
          <button
            onClick={handleGenerateMockData}
            className="text-xs text-foreground/60 hover:text-foreground px-2 py-1 rounded hover:bg-secondary/50 transition-colors"
          >
            模拟数据
          </button>

          {/* 清除数据按钮 */}
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-foreground/60 hover:text-red-500 px-2 py-1 rounded hover:bg-secondary/50 transition-colors"
          >
            清除数据
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-3 sm:gap-4 overflow-hidden">
        {/* 今日统计（含连续专注天数） */}
        <TodayStats stats={stats.todayStats} streakDays={stats.streakDays} />

        {/* 本周趋势 - 占满剩余高度 */}
        <WeekStats stats={stats.weekStats} />
      </div>

      {/* 确认弹框 */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="确认清除"
        message="确定要清除所有统计数据吗？此操作不可恢复。"
        onConfirm={handleClearData}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
