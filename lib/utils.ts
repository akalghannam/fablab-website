export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDateTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr)
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function calculateDuration(checkIn: string, checkOut: string): string {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}س ${minutes}د`
}

export function equipmentConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    excellent: 'ممتاز',
    good: 'جيد',
    fair: 'مقبول',
    poor: 'سيء',
  }
  return labels[condition] ?? condition
}

export function cleanlinessLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'قذر جداً',
    2: 'قذر',
    3: 'مقبول',
    4: 'نظيف',
    5: 'نظيف جداً',
  }
  return labels[rating] ?? String(rating)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
