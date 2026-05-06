import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 简易柱状图组件
 */
export function TrendChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((item, index) => {
        const height = (item.count / maxCount) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-secondary rounded-t h-full min-h-[4px] relative">
              <div
                className="absolute bottom-0 w-full bg-primary rounded-t transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs text-foreground/60">
              {new Date(item.date).getDay() === 0 ? '日' :
                ['一', '二', '三', '四', '五', '六'][new Date(item.date).getDay() - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}