import React from 'react';

/**
 * 进度条列表 - 本周趋势展示
 * 数值清晰，小数值也能良好展示
 */
export function TrendChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <div className="space-y-2 sm:space-y-3">
      {data.map((item, index) => {
        const heightPercent = (item.count / maxCount) * 100;
        const dayName = dayNames[new Date(item.date).getDay()];
        // 格式化日期显示 M/D
        const [month, day] = item.date.split('-').slice(1);
        const dateStr = `${parseInt(month)}/${parseInt(day)}`;

        return (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            {/* 日期 */}
            <span className="w-8 sm:w-10 text-xs text-foreground/60 text-right">{dateStr}</span>

            {/* 进度条 */}
            <div className="flex-1 h-3 sm:h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${heightPercent}%` }}
              />
            </div>

            {/* 数值 */}
            <span className="w-6 sm:w-8 text-xs sm:text-sm text-foreground/80 text-right font-medium">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}