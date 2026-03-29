import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-default)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90',
        destructive:
          'bg-[rgb(var(--destructive))] text-[rgb(var(--destructive-foreground))] hover:opacity-90',
        outline:
          'border border-[rgb(var(--border))] bg-transparent hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--foreground))]',
        secondary:
          'bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:opacity-90',
        ghost:
          'hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--foreground))]',
        link: 'text-[rgb(var(--primary))] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-[var(--radius-default)] px-3',
        lg: 'h-11 rounded-[var(--radius-md)] px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
