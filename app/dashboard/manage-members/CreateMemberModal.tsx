'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createMember } from '@/app/actions/members-management'
import { PERMISSION_LABELS } from '@/types'
import { Plus, X, CheckCircle } from 'lucide-react'
import type { Permission } from '@/types'

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[]

export function CreateMemberModal({ granterId }: { granterId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([])

  function togglePerm(p: Permission) {
    setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    selectedPerms.forEach(p => fd.append('permissions', p))

    const result = await createMember(fd)
    if (result.error) { setError(result.error); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => { setOpen(false); setSuccess(false); router.refresh() }, 1500)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={16} />
        إنشاء عضو جديد
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">إنشاء عضو جديد</h2>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-medium">تم إنشاء العضو بنجاح!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="الاسم الكامل" name="full_name" required placeholder="محمد عبدالله" />
                <Input label="البريد الإلكتروني" name="email" type="email" required
                  placeholder="member@example.com" className="english-text" />
                <Input label="اسم المستخدم" name="username" placeholder="username" className="english-text" />
                <Input label="كلمة المرور المؤقتة" name="password" type="text" required
                  placeholder="يمكن للعضو تغييرها لاحقاً" className="english-text" minLength={8} />

                <div>
                  <p className="label-text mb-2">الصلاحيات</p>
                  <div className="space-y-2">
                    {ALL_PERMISSIONS.map(p => (
                      <label key={p}
                        className="flex items-center gap-3 p-3 glass-card cursor-pointer hover:bg-white/10 transition-colors rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(p)}
                          onChange={() => togglePerm(p)}
                          className="w-4 h-4 accent-brand-orange"
                        />
                        <span className="text-white text-sm">{PERMISSION_LABELS[p]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={loading} className="flex-1">إنشاء العضو</Button>
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
