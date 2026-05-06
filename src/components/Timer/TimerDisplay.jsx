import React from 'react';
import { formatTime } from '@/utils/time';
import { MODE_CONFIG, SESSION_TYPE } from '@/utils/constants';
import { cn } from '@/lib/utils';

/**
 * 计时器数字显示组件
 */
export function TimerDisplay({ timeRemaining, mode, isRunning }) {
  const { label, color } = MODE_CONFIG[mode];

  // 未运行时显示"准备开始"而非"专注中"
  const displayLabel = !isRunning && mode === SESSION_TYPE.WORK ? '准备开始' : label;

  return (
    <div className="flex flex-col items-center">
      <span className={cn('text-sm font-medium uppercase tracking-wider mb-2', color)}>
        {displayLabel}
      </span>
      <span className="text-5xl font-bold text-foreground tabular-nums">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}