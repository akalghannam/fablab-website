'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { deleteEvent } from '@/app/actions/events'
import { EventFormModal } from './EventFormModal'
import { Trash2 } from 'lucide-react'
import type { Event } from '@/types'

export function EventActions({ event }: { event: Event }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteEvent(event.id)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <EventFormModal mode="edit" event={event} />
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
  )
}
