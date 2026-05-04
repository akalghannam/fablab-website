import { cn } from '@/lib/utils'
import { LAB_STATUS_LABELS } from '@/types'
import type { LabStatusValue } from '@/types'

interface Props {
  status: LabStatusValue
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  notes?: string | null
}

const dotColors: Record<LabStatusValue, string> = {
  red:    'bg-red-500    shadow-[0_0_16px_4px_rgba(239,68,68,0.5)]',
  yellow: 'bg-yellow-400 shadow-[0_0_16px_4px_rgba(250,204,21,0.5)]',
  green:  'bg-emerald-400 shadow-[0_0_16px_4px_rgba(52,211,153,0.5)]',
}

const labelColors: Record<LabStatusValue, string> = {
  red:    'text-red-400',
  yellow: 'text-yellow-400',
  green:  'text-emerald-400',
}

const dotSizes = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-bold',
}

export function LabStatusDot({ status, size = 'md', showLabel = true, notes }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn(
        'rounded-full flex-shrink-0 animate-pulse',
        dotColors[status],
        dotSizes[size]
      )} />
      {showLabel && (
        <div>
          <span className={cn('font-semibold', labelColors[status], textSizes[size])}>
            {LAB_STATUS_LABELS[status]}
          </span>
          {notes && (
            <p className="text-white/40 text-xs mt-0.5">{notes}</p>
          )}
        </div>
      )}
    </div>
  )
}
