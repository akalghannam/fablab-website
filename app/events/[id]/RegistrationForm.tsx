'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { registerForEvent } from '@/app/actions/events'
import { CheckCircle } from 'lucide-react'

interface Props {
  eventId: string
}

export function EventRegistrationForm({ eventId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('event_id', eventId)

    const result = await registerForEvent(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="glass-card p-6 text-center">
        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
        <h3 className="text-white font-bold text-lg mb-2">تم التسجيل بنجاح!</h3>
        <p className="text-white/50 text-sm leading-relaxed">
          تم تسجيل حضورك في الفعالية. ستتلقى تأكيداً على بريدك الإلكتروني.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 sticky top-20">
      <h2 className="text-white font-bold text-xl mb-5">التسجيل في الفعالية</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="الاسم الكامل"
          name="name"
          type="text"
          placeholder="محمد عبدالله"
          required
        />

        <Input
          label="البريد الإلكتروني"
          name="email"
          type="email"
          placeholder="example@email.com"
          required
          className="english-text"
        />

        <Input
          label="رقم الجوال"
          name="phone"
          type="tel"
          placeholder="05xxxxxxxx"
          className="english-text"
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          تسجيل الحضور
        </Button>
      </form>
    </div>
  )
}
