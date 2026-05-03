'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { deleteEvent } from '@/app/actions/events'
import { Trash2 } from 'lucide-react'

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteEvent(eventId)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
          تأكيد
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          إلغاء
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}
      className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
      <Trash2 size={14} />
      حذف
    </Button>
  )
}
