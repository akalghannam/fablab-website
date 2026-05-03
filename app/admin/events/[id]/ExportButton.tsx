'use client'

import { Button } from '@/components/ui/Button'
import { exportEventRegistrations } from '@/app/actions/admin'
import { Download } from 'lucide-react'

interface Props {
  eventId: string
  eventTitle: string
}

export function ExportButton({ eventId, eventTitle }: Props) {
  async function handleExport() {
    const data = await exportEventRegistrations(eventId)

    const headers = ['الاسم', 'البريد الإلكتروني', 'الجوال', 'تاريخ التسجيل']
    const rows = data.map(r => [
      r.name,
      r.email,
      r.phone ?? '',
      new Date(r.registered_at).toLocaleDateString('ar-SA'),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${eventTitle}-registrations.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download size={15} />
      تصدير CSV
    </Button>
  )
}
