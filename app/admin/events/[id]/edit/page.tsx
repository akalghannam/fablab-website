'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getEvent, updateEvent } from '@/app/actions/events'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/types'

interface Props {
  params: { id: string }
}

export default function EditEventPage({ params }: Props) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getEvent(params.id).then(e => setEvent(e))
  }, [params.id])

  if (!event) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-white/40">جارٍ التحميل...</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await updateEvent(params.id, formData)

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
        <h1 className="text-2xl font-bold text-white">تعديل الفعالية</h1>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <Input
            label="عنوان الفعالية"
            name="title"
            type="text"
            defaultValue={event.title}
            required
          />

          <Textarea
            label="الوصف"
            name="description"
            defaultValue={event.description ?? ''}
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="التاريخ"
              name="date"
              type="date"
              defaultValue={event.date}
              required
              className="english-text"
            />
            <Input
              label="الوقت"
              name="time"
              type="time"
              defaultValue={event.time}
              required
              className="english-text"
            />
          </div>

          <Input
            label="الموقع"
            name="location"
            type="text"
            defaultValue={event.location ?? ''}
          />

          <Input
            label="السعة القصوى"
            name="capacity"
            type="number"
            min="1"
            defaultValue={event.capacity?.toString() ?? ''}
            className="english-text"
          />

          <Input
            label="رابط الصورة"
            name="image_url"
            type="url"
            defaultValue={event.image_url ?? ''}
            className="english-text"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} size="lg">
              حفظ التعديلات
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
