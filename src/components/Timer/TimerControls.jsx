import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 计时器控制按钮组件
 */
export function TimerControls({ isRunning, onStart, onPause, onReset }) {
  return (
    <div className="flex items-center gap-4">
      {/* 开始/暂停按钮 */}
      {isRunning ? (
        <Button size="lg" onClick={onPause} className="w-24">
          暂停
        </Button>
      ) : (
        <Button size="lg" onClick={onStart} className="w-24">
          开始
        </Button>
      )}

      {/* 重置按钮 */}
      <Button
        variant="ghost"
        size="lg"
        onClick={onReset}
        disabled={isRunning}
        className={cn(!isRunning && 'opacity-50')}
      >
        重置
      </Button>
    </div>
  );
}