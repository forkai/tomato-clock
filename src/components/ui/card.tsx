import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={cn('rounded-lg border border-secondary bg-card p-6', className)}
    {...props}
  />
)
Card.displayName = 'Card'

const CardHeader = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
)
CardHeader.displayName = 'CardHeader'

const CardTitle = ({ ref, className, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
)
CardTitle.displayName = 'CardTitle'

const CardContent = ({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('', className)} {...props} />
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
