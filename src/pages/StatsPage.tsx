import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDatabase } from '@/hooks/useDatabase'
import { TodayStats } from '@/components/Stats/TodayStats'
import { WeekStats } from '@/components/Stats/WeekStats'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface TodayStatsData {
  count: number
  totalDuration: number
}

interface WeekStatsData {
  days: Array<{ date: string; completed: number }>
  totalWorkMinutes: number
  averageWorkMinutes: number
  streakDays: number
}

interface Stats {
  todayStats: TodayStatsData
  weekStats: Array<{ date: string; count: number }>
  streakDays: number
}

export function StatsPage() {
  const { getTodayStats, getWeekStats, clearAllData, generateMockData, dataVersion } = useDatabase()
  const [showConfirm, setShowConfirm] = useState(false)
  const [stats, setStats] = useState<Stats>({
    todayStats: { count: 0, totalDuration: 0 },
    weekStats: [],
    streakDays: 0
  })

  useEffect(() => {
    async function fetchStats() {
      const today = await getTodayStats()
      const week: WeekStatsData = await getWeekStats()
      const streak = week.days.filter((d) => d.completed > 0).length
      setStats({
        todayStats: { count: today.completedToday, totalDuration: today.completedToday * 25 * 60 },
        weekStats: week.days.map((d) => ({ date: d.date, count: d.completed })),
        streakDays: streak
      })
    }
    fetchStats()
  }, [dataVersion, getTodayStats, getWeekStats])

  const handleGenerateMockData = async () => {
    await generateMockData()
  }

  const handleClearData = async () => {
    await clearAllData()
    setShowConfirm(false)
  }

  return (
    <div className="h-screen bg-background px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
        <Link
          to="/"
          className="p-2 text-foreground/60 hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
          title="返回计时器"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateMockData}
            className="text-xs text-foreground/60 hover:text-foreground px-2 py-1 rounded hover:bg-secondary/50 transition-colors"
          >
            模拟数据
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-foreground/60 hover:text-red-500 px-2 py-1 rounded hover:bg-secondary/50 transition-colors"
          >
            清除数据
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-3 sm:gap-4 overflow-hidden">
        <TodayStats stats={stats.todayStats} streakDays={stats.streakDays} />
        <WeekStats stats={stats.weekStats} />
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="确认清除"
        message="确定要清除所有统计数据吗？此操作不可恢复。"
        onConfirm={handleClearData}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
