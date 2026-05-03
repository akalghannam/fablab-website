'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { updateMemberStatus, updateMemberRole } from '@/app/actions/admin'

interface Props {
  userId: string
  isActive: boolean
  currentRole: string
}

export function MemberActions({ userId, isActive, currentRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleStatus() {
    setLoading(true)
    await updateMemberStatus(userId, !isActive)
    router.refresh()
    setLoading(false)
  }

  async function toggleRole() {
    setLoading(true)
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    await updateMemberRole(userId, newRole)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant={isActive ? 'danger' : 'secondary'}
        size="sm"
        loading={loading}
        onClick={toggleStatus}
        className="text-xs px-2.5 py-1"
      >
        {isActive ? 'تعطيل' : 'تفعيل'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        loading={loading}
        onClick={toggleRole}
        className="text-xs px-2.5 py-1"
      >
        {currentRole === 'admin' ? 'إلغاء مدير' : 'جعله مديراً'}
      </Button>
    </div>
  )
}
