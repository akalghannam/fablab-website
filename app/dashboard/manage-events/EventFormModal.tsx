'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { createEvent, updateEvent } from '@/app/actions/events'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, CheckCircle, ImageIcon } from 'lucide-react'
import type { Event } from '@/types'

interface Props {
  mode: 'create'
  event?: never
}
interface EditProps {
  mode: 'edit'
  event: Event
}

export function EventFormModal({ mode, event }: Props | EditProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [imageUrl, setImageUrl] = useState(event?.image_url ?? '')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const path = `events/${Date.now()}-${file.name}`
    const { error: uploadErr } = await supabase.storage.from('event-images').upload(path, file)
    if (!uploadErr) {
      const { data } = supabase.storage.from('event-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    fd.set('image_url', imageUrl)

    const result = mode === 'create'
      ? await createEvent(fd)
      : await updateEvent(event!.id, fd)

    if (result?.error) { setError(result.error); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setSuccess(false); router.refresh() }, 1200)
  }

  return (
    <>
      {mode === 'create' ? (
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus size={16} />
          إضافة فعالية
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          تعديل
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">
                {mode === 'create' ? 'إضافة فعالية جديدة' : 'تعديل الفعالية'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-medium">
                  {mode === 'create' ? 'تم إنشاء الفعالية!' : 'تم تحديث الفعالية!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="عنوان الفعالية" name="title"
                  defaultValue={event?.title ?? ''} required placeholder="ورشة عمل..." />
                <Textarea label="الوصف" name="description"
                  defaultValue={event?.description ?? ''} rows={3} />

                <div className="grid grid-cols-2 gap-3">
                  <Input label="التاريخ" name="date" type="date"
                    defaultValue={event?.date ?? ''} required className="english-text" />
                  <Input label="الوقت" name="time" type="time"
                    defaultValue={event?.time ?? ''} required className="english-text" />
                </div>

                <Input label="الموقع" name="location" defaultValue={event?.location ?? ''} />
                <Input label="السعة" name="capacity" type="number"
                  defaultValue={event?.capacity?.toString() ?? ''} className="english-text" />

                {/* Image upload */}
                <div>
                  <p className="label-text mb-1.5">صورة الفعالية</p>
                  <label className="flex items-center gap-3 glass-card p-3 cursor-pointer hover:bg-white/10 transition-colors rounded-lg">
                    <ImageIcon size={18} className="text-brand-blue" />
                    <span className="text-white/60 text-sm">
                      {uploading ? 'جارٍ الرفع...' : imageUrl ? 'تغيير الصورة' : 'رفع صورة'}
                    </span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {imageUrl && (
                    <p className="text-brand-blue text-xs mt-1.5">✓ تم رفع الصورة</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={loading || uploading} className="flex-1">
                    {mode === 'create' ? 'إنشاء الفعالية' : 'حفظ التعديلات'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
