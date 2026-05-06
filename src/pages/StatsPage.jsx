import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/hooks/useDatabase';
import { TodayStats } from '@/components/Stats/TodayStats';
import { WeekStats } from '@/components/Stats/WeekStats';

/**
 * 统计页面
 * 显示今日统计（包含连续专注天数）、本周趋势
 */
export function StatsPage() {
  const { getTodayStats, getWeekStats, clearAllData, generateMockData } = useDatabase();
  const [showConfirm, setShowConfirm] = useState(false);

  const todayStats = getTodayStats(0);
  const weekStats = getWeekStats(0);

  // 计算连续专注天数（本周有几天完成番茄）
  const streakDays = weekStats.filter(d => d.count > 0).length;

  // 清除数据
  const handleClearData = () => {
    clearAllData();
    setShowConfirm(false);
    // 刷新页面以更新显示
    window.location.reload();
  };

  return (
    <div className="h-screen bg-background px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
      {/* 顶部栏：返回按钮 + 清除数据按钮 */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-foreground/60 hover:text-foreground"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回计时器
        </Link>

        <div className="flex gap-2">
          {/* 模拟数据按钮 */}
          <button
            onClick={() => generateMockData() || window.location.reload()}
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
        <TodayStats stats={todayStats} streakDays={streakDays} />

        {/* 本周趋势 - 占满剩余高度 */}
        <WeekStats stats={weekStats} />
      </div>

      {/* 确认弹框 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">确认清除</h3>
            <p className="text-foreground/60 mb-4">确定要清除所有统计数据吗？此操作不可恢复。</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
