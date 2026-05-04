'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { LabStatusDot } from '@/components/LabStatusDot'
import { setLabStatus } from '@/app/actions/current-lab-status'
import { CheckCircle } from 'lucide-react'
import type { LabStatusValue } from '@/types'

const OPTIONS: { value: LabStatusValue; label: string; desc: string; border: string }[] = [
  { value: 'red',    label: 'مغلق',          desc: 'المقر مغلق ولا يوجد نشاط', border: 'border-red-500/50 bg-red-500/10' },
  { value: 'yellow', label: 'يوجد اجتماع',   desc: 'يجري اجتماع أو نشاط خاص', border: 'border-yellow-400/50 bg-yellow-400/10' },
  { value: 'green',  label: 'مفتوح',         desc: 'المقر مفتوح للجميع',        border: 'border-emerald-400/50 bg-emerald-400/10' },
]

export default function LabStatusControlPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<LabStatusValue>('red')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.set('status', selected)
    fd.set('notes', notes)

    const result = await setLabStatus(fd)
    if (result.error) { setError(result.error); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => { setSuccess(false); router.refresh() }, 2000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">حالة المقر</h1>
        <p className="text-white/40 text-sm">اختر الحالة الحالية للمقر وأضف ملاحظة اختيارية</p>
      </div>

      {success && (
        <div className="glass-card p-4 border-glow-blue flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400" />
          <p className="text-emerald-400 font-medium">تم تحديث حالة المقر بنجاح</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Status options */}
        <div className="space-y-3">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`w-full glass-card p-4 flex items-center gap-4 border-2 transition-all text-right ${
                selected === opt.value
                  ? opt.border
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <LabStatusDot status={opt.value} size="lg" showLabel={false} />
              <div className="flex-1">
                <p className="text-white font-bold">{opt.label}</p>
                <p className="text-white/50 text-sm">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                selected === opt.value ? 'border-white bg-white' : 'border-white/30'
              }`}>
                {selected === opt.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-dark" />
                )}
              </div>
            </button>
          ))}
        </div>

        <Textarea
          label="ملاحظات (اختياري)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="أضف تفاصيل إضافية عن حالة المقر..."
          rows={3}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          تحديث حالة المقر
        </Button>
      </form>
    </div>
  )
}
