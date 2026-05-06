import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendChart } from './TrendChart';

/**
 * 本周统计组件
 * 占据页面剩余高度
 */
export function WeekStats({ stats }) {
  return (
    <Card className="bg-secondary/50 flex-1 flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-base sm:text-lg">本周趋势</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <TrendChart data={stats} />
      </CardContent>
    </Card>
  );
}