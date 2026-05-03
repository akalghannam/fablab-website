import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: 'orange' | 'blue' | 'none'
  hover?: boolean
}

export function Card({ children, className, glow = 'none', hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-6',
        glow === 'orange' && 'border-glow-orange',
        glow === 'blue' && 'border-glow-blue',
        hover && 'hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  accent?: 'orange' | 'blue'
  subtitle?: string
}

export function StatCard({ title, value, icon, accent = 'blue', subtitle }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      {icon && (
        <div className={cn(
          'p-3 rounded-xl flex-shrink-0',
          accent === 'orange' ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-blue/15 text-brand-blue'
        )}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-white/50 text-sm mb-0.5">{title}</p>
        <p className={cn(
          'text-2xl font-bold',
          accent === 'orange' ? 'text-brand-orange' : 'text-brand-blue'
        )}>
          {value}
        </p>
        {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  )
}
