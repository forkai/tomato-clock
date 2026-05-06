import { formatTime } from '@/utils/time'
import { MODE_CONFIG, SESSION_TYPE } from '@/utils/constants'
import { cn } from '@/lib/utils'
import type { SessionType } from '@/types/timer'

interface TimerDisplayProps {
  timeRemaining: number
  mode: SessionType
  isRunning: boolean
}

export function TimerDisplay({ timeRemaining, mode, isRunning }: TimerDisplayProps) {
  const { label, color } = MODE_CONFIG[mode]

  const displayLabel = !isRunning && mode === SESSION_TYPE.WORK ? '准备开始' : label

  return (
    <div className="flex flex-col items-center">
      <span className={cn('text-sm font-medium uppercase tracking-wider mb-2', color)}>
        {displayLabel}
      </span>
      <span className="text-5xl font-bold text-foreground tabular-nums">
        {formatTime(timeRemaining)}
      </span>
    </div>
  )
}
