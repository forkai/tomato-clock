import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/utils/time';

/**
 * 今日统计组件
 * 左侧：今日完成统计，右侧：连续专注天数
 */
export function TodayStats({ stats, streakDays = 0 }) {
  return (
    <Card className="bg-secondary/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex">
          {/* 左侧：今日完成 */}
          <div className="flex-1 text-center sm:text-left">
            <div className="text-sm text-foreground/60 mb-1">今日完成</div>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-3xl sm:text-4xl font-bold text-primary">{stats.count}</span>
              <span className="text-foreground/60">个番茄</span>
            </div>
            <div className="text-sm text-foreground/60 mt-1">
              总专注 {formatDuration(stats.totalDuration)}
            </div>
          </div>

          {/* 中间竖线分隔 */}
          <div className="w-px bg-foreground/20 mx-3 sm:mx-6" />

          {/* 右侧：连续专注 */}
          <div className="flex-1 text-center sm:text-right">
            <div className="text-sm text-foreground/60 mb-1">连续专注</div>
            <div className="flex items-baseline gap-2 justify-center sm:justify-end">
              <span className="text-3xl sm:text-4xl font-bold text-primary">{streakDays}</span>
              <span className="text-foreground/60">天</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}