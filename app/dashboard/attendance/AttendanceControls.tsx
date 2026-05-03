'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { checkIn, checkOut } from '@/app/actions/attendance'
import { createLabStatusReport } from '@/app/actions/lab-status'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { LogIn, LogOut, Camera, X } from 'lucide-react'
import type { AttendanceLog } from '@/types'

interface Props {
  activeLog: AttendanceLog | null
  userId: string
}

type Step = 'idle' | 'lab-status-checkin' | 'lab-status-checkout' | 'done'

export function AttendanceControls({ activeLog, userId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  async function handleCheckIn() {
    setLoading(true)
    setError('')
    const fd = new FormData()
    const result = await checkIn(fd)
    if (result.error) { setError(result.error); setLoading(false); return }
    setCurrentLogId(result.logId ?? null)
    setStep('lab-status-checkin')
    setLoading(false)
  }

  async function handleCheckOut() {
    if (!activeLog) return
    setStep('lab-status-checkout')
    setCurrentLogId(activeLog.id)
  }

  async function handleLabStatusSubmit(e: React.FormEvent<HTMLFormElement>, type: 'check-in' | 'check-out') {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    fd.set('type', type)
    fd.set('attendance_log_id', currentLogId ?? '')
    fd.set('photos', JSON.stringify(photoUrls))

    await createLabStatusReport(fd)

    if (type === 'check-out' && activeLog) {
      const result = await checkOut(activeLog.id)
      if (result.error) { setError(result.error); setLoading(false); return }
    }

    setStep('done')
    setLoading(false)
    setTimeout(() => { setStep('idle'); router.refresh() }, 1500)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    setUploadingPhoto(true)

    const supabase = createClient()
    const urls: string[] = []

    for (const file of Array.from(e.target.files)) {
      const path = `${userId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('lab-status-photos')
        .upload(path, file, { upsert: false })

      if (!error) {
        const { data } = supabase.storage.from('lab-status-photos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }

    setPhotoUrls(prev => [...prev, ...urls])
    setUploadingPhoto(false)
  }

  const conditionOptions = [
    { value: 'excellent', label: 'ممتاز' },
    { value: 'good', label: 'جيد' },
    { value: 'fair', label: 'مقبول' },
    { value: 'poor', label: 'سيء' },
  ]

  const cleanlinessOptions = [
    { value: '5', label: '5 - نظيف جداً' },
    { value: '4', label: '4 - نظيف' },
    { value: '3', label: '3 - مقبول' },
    { value: '2', label: '2 - قذر' },
    { value: '1', label: '1 - قذر جداً' },
  ]

  if (step === 'done') {
    return (
      <div className="glass-card p-6 text-center border-glow-blue">
        <p className="text-emerald-400 font-medium text-lg">✓ تم بنجاح!</p>
        <p className="text-white/40 text-sm mt-1">جارٍ التحديث...</p>
      </div>
    )
  }

  if (step === 'lab-status-checkin' || step === 'lab-status-checkout') {
    const isCheckIn = step === 'lab-status-checkin'
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">
            {isCheckIn ? 'توثيق حالة المختبر عند الدخول' : 'توثيق حالة المختبر عند الخروج'}
          </h2>
          <button onClick={() => { setStep('idle'); router.refresh() }}
            className="text-white/30 hover:text-white/70 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => handleLabStatusSubmit(e, isCheckIn ? 'check-in' : 'check-out')}
          className="space-y-5">
          <Select
            label="حالة الأجهزة والمعدات"
            name="equipment_condition"
            options={conditionOptions}
            placeholder="اختر الحالة"
            required
          />

          <Select
            label="تقييم النظافة"
            name="cleanliness_rating"
            options={cleanlinessOptions}
            placeholder="اختر التقييم"
            required
          />

          <Textarea
            label="ملاحظات إضافية"
            name="notes"
            placeholder="أي ملاحظات أو مشاكل في المختبر..."
            rows={3}
          />

          {/* Photo upload */}
          <div>
            <label className="label-text">صور المختبر (اختياري)</label>
            <label className="flex items-center gap-3 glass-card p-4 cursor-pointer hover:bg-white/10 transition-colors mt-1.5">
              <Camera size={20} className="text-brand-blue" />
              <span className="text-white/60 text-sm">
                {uploadingPhoto ? 'جارٍ الرفع...' : 'اضغط لرفع صورة'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
            {photoUrls.length > 0 && (
              <p className="text-brand-blue text-xs mt-2">تم رفع {photoUrls.length} صورة ✓</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading || uploadingPhoto} className="w-full" size="lg">
            {isCheckIn ? 'تسجيل الدخول' : 'تسجيل الخروج'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      {activeLog ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
            <div>
              <p className="text-emerald-400 font-medium">أنت حالياً في المختبر</p>
              <p className="text-white/40 text-sm">دخلت في: {formatDateTime(activeLog.check_in)}</p>
            </div>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          <Button
            variant="danger"
            onClick={handleCheckOut}
            className="w-full"
            size="lg"
          >
            <LogOut size={18} />
            تسجيل الخروج من المختبر
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-brand-blue/5 border border-brand-blue/15 rounded-xl">
            <p className="text-white/60 text-sm text-center">أنت خارج المختبر حالياً</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          <Button
            variant="secondary"
            onClick={handleCheckIn}
            loading={loading}
            className="w-full"
            size="lg"
          >
            <LogIn size={18} />
            تسجيل الدخول إلى المختبر
          </Button>
        </div>
      )}
    </div>
  )
}
