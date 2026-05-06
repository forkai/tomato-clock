import React, { useState, useCallback } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useNotification } from '@/hooks/useNotification';
import { useDatabase } from '@/hooks/useDatabase';
import { TimerDisplay } from '@/components/Timer/TimerDisplay';
import { TimerControls } from '@/components/Timer/TimerControls';
import { ProgressRing } from '@/components/Timer/ProgressRing';
import { TodayStats } from '@/components/Stats/TodayStats';
import { WeekStats } from '@/components/Stats/WeekStats';
import { POMODORO_CONFIG, SESSION_TYPE } from '@/utils/constants';

function App() {
  const { notifyPomodoroComplete } = useNotification();
  const { saveSession, getTodayStats, getWeekStats } = useDatabase();

  // 统计数据刷新机制
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshStats = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // 番茄完成回调
  const handlePomodoroComplete = useCallback((mode, actualDuration) => {
    // 发送通知
    notifyPomodoroComplete(mode);

    // 保存到数据库
    if (mode === SESSION_TYPE.WORK) {
      saveSession(actualDuration || POMODORO_CONFIG.WORK_DURATION, mode);
      refreshStats();
    }
  }, [notifyPomodoroComplete, saveSession, refreshStats]);

  const {
    mode,
    timeRemaining,
    isRunning,
    sessionsCompleted,
    start,
    pause,
    reset
  } = useTimer(handlePomodoroComplete);

  // 获取统计数据
  const todayStats = getTodayStats(refreshKey);
  const weekStats = getWeekStats(refreshKey);

  // 计算进度
  const totalDuration = {
    [SESSION_TYPE.WORK]: POMODORO_CONFIG.WORK_DURATION,
    [SESSION_TYPE.SHORT_BREAK]: POMODORO_CONFIG.SHORT_BREAK_DURATION,
    [SESSION_TYPE.LONG_BREAK]: POMODORO_CONFIG.LONG_BREAK_DURATION
  }[mode];

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-8 overflow-hidden">
      {/* 顶部进度指示 */}
      <div className="text-sm text-foreground/60 mb-4">
        已完成 {sessionsCompleted} 个番茄
      </div>

      {/* 计时器核心 */}
      <div className="relative">
        <ProgressRing progress={progress} />
        <div className="absolute inset-0 flex items-center justify-center">
          <TimerDisplay timeRemaining={timeRemaining} mode={mode} />
        </div>
      </div>

      {/* 控制按钮 */}
      <TimerControls
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
        onReset={reset}
      />

      {/* 统计面板 */}
      <div className="w-full mt-8 space-y-4">
        <TodayStats stats={todayStats} />
        <WeekStats stats={weekStats} />
      </div>
    </div>
  );
}

export default App;