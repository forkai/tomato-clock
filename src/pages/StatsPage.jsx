import React from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/hooks/useDatabase';
import { TodayStats } from '@/components/Stats/TodayStats';
import { WeekStats } from '@/components/Stats/WeekStats';

/**
 * 统计页面
 * 显示今日统计（包含连续专注天数）、本周趋势
 */
export function StatsPage() {
  const { getTodayStats, getWeekStats } = useDatabase();

  const todayStats = getTodayStats(0);
  const weekStats = getWeekStats(0);

  // 计算连续专注天数（本周有几天完成番茄）
  const streakDays = weekStats.filter(d => d.count > 0).length;

  return (
    <div className="h-screen bg-background px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
      {/* 返回按钮 */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-foreground/60 hover:text-foreground mb-4 sm:mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回计时器
      </Link>

      <div className="flex flex-col h-full">
        {/* 今日统计（含连续专注天数） */}
        <TodayStats stats={todayStats} streakDays={streakDays} />

        {/* 本周趋势 - 占满剩余高度 */}
        <WeekStats stats={weekStats} />
      </div>
    </div>
  );
}
