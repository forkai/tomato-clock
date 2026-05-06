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

function TimerPage() {
  const { notifyPomodoroComplete } = useNotification()
  const { saveSession } = useDatabase()

  const handlePomodoroComplete = useCallback(
    (mode: SessionType) => {
      notifyPomodoroComplete(mode)
      if (mode === 'work') {
        saveSession(POMODORO_CONFIG.WORK_DURATION, mode)
      }
    },
    [notifyPomodoroComplete, saveSession]
  )

  const { mode, timeRemaining, isRunning, sessionsCompleted, start, pause, reset } = useTimer(
    { onComplete: handlePomodoroComplete }
  )

  const totalDuration = mode === SESSION_TYPE.WORK
    ? POMODORO_CONFIG.WORK_DURATION
    : mode === SESSION_TYPE.SHORT_BREAK
      ? POMODORO_CONFIG.SHORT_BREAK_DURATION
      : POMODORO_CONFIG.LONG_BREAK_DURATION

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100

  return (
    <div className="h-screen bg-background flex flex-col items-center px-6 py-8">
      <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
        <div className="text-sm text-foreground/60">已完成 {sessionsCompleted} 个番茄</div>
        <Link
          to="/stats"
          className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          aria-label="查看统计"
        >
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

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <ProgressRing progress={progress} />
          <div className="absolute inset-0 flex items-center justify-center">
            <TimerDisplay timeRemaining={timeRemaining} mode={mode} isRunning={isRunning} />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 pb-2">
        <TimerControls isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />
      </div>
    </div>
  )
}

export { TimerPage }
export default TimerPage
