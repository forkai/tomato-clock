import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendChart } from './TrendChart';

/**
 * 本周统计组件
 */
export function WeekStats({ stats }) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">本周趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <TrendChart data={stats} />
      </CardContent>
    </Card>
  );
}