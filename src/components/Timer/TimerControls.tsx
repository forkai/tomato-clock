import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export function TimerControls({ isRunning, onStart, onPause, onReset }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {isRunning ? (
        <Button size="lg" onClick={onPause} className="w-24">
          暂停
        </Button>
      ) : (
        <Button size="lg" onClick={onStart} className="w-24">
          开始
        </Button>
      )}

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
  )
}
