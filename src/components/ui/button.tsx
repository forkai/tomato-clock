import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30',
        ghost: 'hover:bg-secondary/80 text-foreground/80 hover:text-foreground',
        outline: 'border border-border hover:bg-secondary/60 text-foreground/80 hover:text-foreground'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-12 px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button = ({ ref, className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
Button.displayName = 'Button'

export { Button, buttonVariants }
