import React from 'react';

/**
 * 进度条列表 - 本周趋势展示
 * 数值清晰，小数值也能良好展示
 */
export function TrendChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="space-y-2 sm:space-y-3">
      {data.map((item, index) => {
        const heightPercent = (item.count / maxCount) * 100;
        const dayName = dayNames[new Date(item.date).getDay()];

        return (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            {/* 日期 */}
            <span className="w-4 text-xs text-foreground/60 text-center">{dayName}</span>

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