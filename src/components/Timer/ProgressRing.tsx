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
      className={cn('transform -rotate-90 drop-shadow-lg', className)}
    >
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.06)"
        strokeWidth="14"
      />
      <circle
        cx="140"
        cy="140"
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))'
        }}
      />
    </svg>
  )
}
