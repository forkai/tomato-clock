import React from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/hooks/useDatabase';
import { TodayStats } from '@/components/Stats/TodayStats';
import { WeekStats } from '@/components/Stats/WeekStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * 统计页面
 * 显示今日统计、本周趋势、连续专注天数
 */
export function StatsPage() {
  const { getTodayStats, getWeekStats } = useDatabase();

  const todayStats = getTodayStats(0);
  const weekStats = getWeekStats(0);

  // 计算连续专注天数（简化版：本周有几天完成番茄）
  const streakDays = weekStats.filter(d => d.count > 0).length;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* 返回按钮 */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-foreground/60 hover:text-foreground mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回计时器
      </Link>

      <div className="space-y-6">
        {/* 今日统计 */}
        <TodayStats stats={todayStats} />

        {/* 本周趋势 */}
        <WeekStats stats={weekStats} />

        {/* 连续专注天数 */}
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-lg">连续专注</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{streakDays}</span>
              <span className="text-foreground/60">天</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
