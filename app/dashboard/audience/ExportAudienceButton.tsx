'use client'

import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'

export function ExportAudienceButton({ registrants }: { registrants: any[] }) {
  function handleExport() {
    const headers = ['الاسم', 'البريد الإلكتروني', 'الجوال', 'الفعالية', 'تاريخ التسجيل']
    const rows = registrants.map(r => [
      r.name,
      r.email,
      r.phone ?? '',
      r.events?.title ?? '',
      new Date(r.registered_at).toLocaleDateString('ar-SA'),
    ])
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audience-registrants.csv'
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
