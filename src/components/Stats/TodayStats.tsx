import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/utils/time'

interface TodayStatsProps {
  stats: {
    count: number
    totalDuration: number
  }
  streakDays?: number
}

export function TodayStats({ stats, streakDays = 0 }: TodayStatsProps) {
  return (
    <Card className="bg-secondary/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-sm text-foreground/60 mb-1">今日完成</div>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-3xl sm:text-4xl font-bold text-primary">{stats.count}</span>
              <span className="text-foreground/60">个番茄</span>
            </div>
            <div className="text-sm text-foreground/60 mt-1">
              总专注 {formatDuration(stats.totalDuration)}
            </div>
          </div>

          <div className="w-px bg-foreground/20 mx-3 sm:mx-6" />

          <div className="flex-1 text-center sm:text-right">
            <div className="text-sm text-foreground/60 mb-1">连续专注</div>
            <div className="flex items-baseline gap-2 justify-center sm:justify-end">
              <span className="text-3xl sm:text-4xl font-bold text-primary">{streakDays}</span>
              <span className="text-foreground/60">天</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
