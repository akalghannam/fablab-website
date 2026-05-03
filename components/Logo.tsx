import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 130, height = 45 }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="FabLab Club"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  )
}
