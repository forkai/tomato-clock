import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTimer } from '@/hooks/useTimer'
import { useNotification } from '@/hooks/useNotification'
import { useDatabase } from '@/hooks/useDatabase'
import { TimerDisplay } from '@/components/Timer/TimerDisplay'
import { TimerControls } from '@/components/Timer/TimerControls'
import { ProgressRing } from '@/components/Timer/ProgressRing'
import { POMODORO_CONFIG, SESSION_TYPE } from '@/utils/constants'
import type { SessionType } from '@/types/timer'

/**
 * 番茄钟计时器页面
 * 应用的主页面，包含：
 * - 顶部：已完成番茄数 + 统计入口
 * - 中间：进度环 + 时间显示
 * - 底部：开始/暂停/重置控制
 */
function TimerPage() {
  const { notifyPomodoroComplete } = useNotification()
  const { saveSession } = useDatabase()

  /**
   * 番茄钟完成时的回调
   * 1. 显示通知提醒用户
   * 2. 如果是工作会话，保存到数据库
   */
  const handlePomodoroComplete = useCallback(
    (mode: SessionType) => {
      // 显示系统通知或浮窗通知
      notifyPomodoroComplete(mode)
      // 仅工作会话需要保存，短长休息不需要记录
      if (mode === 'work') {
        saveSession(POMODORO_CONFIG.WORK_DURATION, mode)
      }
    },
    [notifyPomodoroComplete, saveSession]
  )

  // 从 useTimer hook 获取状态和操作
  const {
    mode,                // 当前模式：'work' | 'shortBreak' | 'longBreak'
    timeRemaining,       // 剩余时间（秒）
    isRunning,           // 是否正在运行
    sessionsCompleted,   // 已完成的番茄数
    start,               // 开始计时
    pause,               // 暂停计时
    reset                // 重置计时器
  } = useTimer({ onComplete: handlePomodoroComplete })

  // 根据当前模式计算总时长和进度百分比
  const totalDuration =
    mode === SESSION_TYPE.WORK
      ? POMODORO_CONFIG.WORK_DURATION       // 工作：25 分钟
      : mode === SESSION_TYPE.SHORT_BREAK
        ? POMODORO_CONFIG.SHORT_BREAK_DURATION // 短休息：5 分钟
        : POMODORO_CONFIG.LONG_BREAK_DURATION    // 长休息：15 分钟

  // 计算进度：已过去的时间 / 总时长（百分比）
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100

  return (
    <div className="h-screen bg-background flex flex-col items-center px-6 py-8">
      {/* 顶部栏：显示完成数和统计入口 */}
      <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
        {/* 显示已完成的番茄钟数量 */}
        <div className="text-sm text-foreground/60">已完成 {sessionsCompleted} 个番茄</div>

        {/* 跳转到统计页面的链接 */}
        <Link
          to="/stats"
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          aria-label="查看统计"
        >
          {/* 统计图表图标 */}
          <svg
            className="w-6 h-6 text-foreground/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </Link>
      </div>

      {/* 中间区域：进度环和时间显示 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* SVG 圆环进度条 */}
          <ProgressRing progress={progress} />
          {/* 时间显示（居中在圆环内） */}
          <div className="absolute inset-0 flex items-center justify-center">
            <TimerDisplay timeRemaining={timeRemaining} mode={mode} isRunning={isRunning} />
          </div>
        </div>
      </div>

      {/* 底部区域：计时器控制按钮 */}
      <div className="flex-shrink-0 pb-2">
        <TimerControls isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />
      </div>
    </div>
  )
}

export { TimerPage }
export default TimerPage