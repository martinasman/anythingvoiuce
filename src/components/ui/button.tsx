import { cn } from '@/lib/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          // Sharp corners
          'rounded-sm',
          // Variants
          {
            'bg-[#5A9BC7] text-white hover:bg-[#4683AE] focus-visible:ring-[#5A9BC7]':
              variant === 'primary',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400':
              variant === 'secondary',
            'border-2 border-[#5A9BC7] text-[#5A9BC7] hover:bg-[#BFD7EA]/20 focus-visible:ring-[#5A9BC7]':
              variant === 'outline',
            'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400':
              variant === 'ghost',
          },
          // Sizes
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-8 py-3.5 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
