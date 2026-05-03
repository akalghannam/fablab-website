'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createEvent } from '@/app/actions/events'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createEvent(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/admin/events')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/events"
          className="text-white/40 hover:text-brand-blue transition-colors">
          <ArrowRight size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">إضافة فعالية جديدة</h1>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <Input
            label="عنوان الفعالية"
            name="title"
            type="text"
            placeholder="ورشة عمل الطباعة ثلاثية الأبعاد"
            required
          />

          <Textarea
            label="الوصف"
            name="description"
            placeholder="وصف تفصيلي للفعالية..."
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="التاريخ"
              name="date"
              type="date"
              required
              className="english-text"
            />
            <Input
              label="الوقت"
              name="time"
              type="time"
              required
              className="english-text"
            />
          </div>

          <Input
            label="الموقع"
            name="location"
            type="text"
            placeholder="قاعة المختبر الرئيسية"
          />

          <Input
            label="السعة القصوى (اختياري)"
            name="capacity"
            type="number"
            min="1"
            placeholder="50"
            className="english-text"
          />

          <Input
            label="رابط الصورة (اختياري)"
            name="image_url"
            type="url"
            placeholder="https://..."
            className="english-text"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} size="lg">
              إنشاء الفعالية
            </Button>
            <Link href="/admin/events">
              <Button type="button" variant="outline" size="lg">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
