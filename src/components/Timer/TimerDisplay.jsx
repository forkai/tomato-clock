import React from 'react';
import { formatTime } from '@/utils/time';
import { MODE_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';

/**
 * 计时器数字显示组件
 */
export function TimerDisplay({ timeRemaining, mode }) {
  const { label, color } = MODE_CONFIG[mode];

  return (
    <div className="flex flex-col items-center">
      <span className={cn('text-sm font-medium uppercase tracking-wider mb-2', color)}>
        {label}
      </span>
      <span className="text-7xl font-bold text-foreground tabular-nums">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}