import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/utils/time';

/**
 * 今日统计组件
 */
export function TodayStats({ stats }) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">今日完成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold text-primary">{stats.count}</div>
            <div className="text-sm text-foreground/60">个番茄</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{formatDuration(stats.totalDuration)}</div>
            <div className="text-sm text-foreground/60">总专注时长</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}