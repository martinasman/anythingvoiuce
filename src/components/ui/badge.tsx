import { cn } from '@/lib/utils/cn'
import { HTMLAttributes, forwardRef } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-sm',
          {
            'bg-slate-100 text-slate-700': variant === 'default',
            'bg-[#BFD7EA] text-[#275379]': variant === 'primary',
            'bg-emerald-100 text-emerald-700': variant === 'success',
            'bg-amber-100 text-amber-700': variant === 'warning',
            'bg-rose-100 text-rose-700': variant === 'error',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
