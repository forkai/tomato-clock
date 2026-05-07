import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 sm:p-6',
      'shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
      className
    )}
    {...props}
  />
)
Card.displayName = 'Card'

const CardHeader = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
)
CardHeader.displayName = 'CardHeader'

const CardTitle = ({ ref, className, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
    {...props}
  />
)
CardTitle.displayName = 'CardTitle'

const CardContent = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('', className)} {...props} />
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
