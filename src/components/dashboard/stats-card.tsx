import { cn } from '@/lib/utils/cn'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red'
}

const variants = {
  default: 'bg-zinc-800/50',
  blue: 'bg-blue-500/10 border-blue-500/20',
  green: 'bg-green-500/10 border-green-500/20',
  yellow: 'bg-yellow-500/10 border-yellow-500/20',
  red: 'bg-red-500/10 border-red-500/20',
}

const iconColors = {
  default: 'text-zinc-400',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-zinc-800 p-6',
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            )}>
              <svg
                className={cn('w-4 h-4', !trend.isPositive && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-zinc-500">vs förra veckan</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg bg-zinc-800', iconColors[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
