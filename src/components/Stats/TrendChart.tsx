interface TrendChartProps {
  data: Array<{ date: string; count: number }>
}

export function TrendChart({ data }: TrendChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-2 sm:space-y-3">
      {data.map((item, index) => {
        const heightPercent = (item.count / maxCount) * 100
        const [month, day] = item.date.split('-').slice(1)
        const dateStr = `${parseInt(month)}/${parseInt(day)}`

        return (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <span className="w-8 sm:w-10 text-xs text-foreground/40 text-right">{dateStr}</span>

            <div className="flex-1 h-3 sm:h-4 bg-secondary/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/80 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${heightPercent}%` }}
              />
            </div>

            <span className="w-6 sm:w-8 text-xs sm:text-sm text-foreground/60 text-right font-medium">
              {item.count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
