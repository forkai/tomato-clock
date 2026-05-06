import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number
  className?: string
}

export function ProgressRing({ progress, className }: ProgressRingProps) {
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg
      width="280"
      height="280"
      viewBox="0 0 280 280"
      className={cn('transform -rotate-90', className)}
    >
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill="none"
        stroke="hsl(217, 33%, 17%)"
        strokeWidth="14"
      />
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill="none"
        stroke="hsl(4, 90%, 58%)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: 'stroke-dashoffset 0.5s ease'
        }}
      />
    </svg>
  )
}
