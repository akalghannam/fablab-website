import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'orange' | 'blue' | 'green' | 'red' | 'gray' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  orange: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
  blue: 'bg-brand-blue/15 text-brand-blue border-brand-blue/30',
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  gray: 'bg-white/10 text-white/60 border-white/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
}

export function Badge({ children, variant = 'blue', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}
