'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { deleteMember, updateMember } from '@/app/actions/members-management'
import { PERMISSION_LABELS } from '@/types'
import { Edit, Trash2, X } from 'lucide-react'
import type { Permission } from '@/types'

interface MemberWithPerms {
  id: string
  full_name: string | null
  email: string
  username: string | null
  is_active: boolean
  permissions: Permission[]
}

export function SuperMemberRow({ member }: { member: MemberWithPerms }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>(member.permissions)

  const allPerms = Object.keys(PERMISSION_LABELS) as Permission[]

  function togglePerm(p: Permission) {
    setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    selectedPerms.forEach(p => fd.append('permissions', p))
    const result = await updateMember(member.id, fd)
    if (result.error) { setError(result.error); setLoading(false); return }
    setEditOpen(false)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteMember(member.id)
    if (result.error) { setError(result.error); setDeleting(false); setConfirming(false); return }
    router.refresh()
  }

  return (
    <>
      <tr className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
        <td className="py-3 px-4">
          <p className="text-white font-medium">{member.full_name ?? '—'}</p>
          <p className="text-white/40 text-xs english-text">{member.email}</p>
          {member.username && <p className="text-white/30 text-xs">@{member.username}</p>}
        </td>
        <td className="py-3 px-4">
          {/* Inline permission toggles */}
          <div className="flex flex-wrap gap-1">
            {allPerms.map(p => (
              <button key={p} onClick={async () => {
                const next = member.permissions.includes(p)
                  ? member.permissions.filter(x => x !== p)
                  : [...member.permissions, p]
                const fd = new FormData()
                fd.set('full_name', member.full_name ?? '')
                fd.set('email', member.email)
                next.forEach(x => fd.append('permissions', x))
                await updateMember(member.id, fd)
                router.refresh()
              }}
                className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                  member.permissions.includes(p)
                    ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/40'
                    : 'bg-white/5 text-white/30 border-white/15 hover:bg-brand-blue/15 hover:text-brand-blue hover:border-brand-blue/30'
                }`}>
                {PERMISSION_LABELS[p]}
              </button>
            ))}
          </div>
        </td>
        <td className="py-3 px-4">
          <Badge variant={member.is_active ? 'green' : 'red'} size="sm">
            {member.is_active ? 'نشط' : 'معطّل'}
          </Badge>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
              <Edit size={14} />
            </Button>
            {!confirming ? (
              <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Trash2 size={14} />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>حذف</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>إلغاء</Button>
              </div>
            )}
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </td>
      </tr>

      {editOpen && (
        <tr>
          <td colSpan={4} className="p-0">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
              <div className="relative glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-lg">تعديل بيانات العضو</h2>
                  <button onClick={() => setEditOpen(false)} className="text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <Input label="الاسم الكامل" name="full_name" defaultValue={member.full_name ?? ''} required />
                  <Input label="البريد الإلكتروني" name="email" type="email"
                    defaultValue={member.email} required className="english-text" />
                  <Input label="اسم المستخدم" name="username"
                    defaultValue={member.username ?? ''} className="english-text" />
                  <Input label="كلمة المرور الجديدة (اختياري)" name="password"
                    type="text" placeholder="اتركها فارغة للإبقاء" className="english-text" />

                  <div>
                    <p className="label-text mb-2">الصلاحيات</p>
                    <div className="space-y-2">
                      {allPerms.map(p => (
                        <label key={p}
                          className="flex items-center gap-3 p-3 glass-card cursor-pointer hover:bg-white/10 transition-colors rounded-lg">
                          <input type="checkbox" checked={selectedPerms.includes(p)}
                            onChange={() => togglePerm(p)} className="w-4 h-4 accent-brand-orange" />
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
                    <Button type="submit" loading={loading} className="flex-1">حفظ</Button>
                    <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
                  </div>
                </form>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
