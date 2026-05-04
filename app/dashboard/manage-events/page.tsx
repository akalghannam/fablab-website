import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyPermissions } from '@/app/actions/permissions'
import { getEvents } from '@/app/actions/events'
import { formatDate, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { EventFormModal } from './EventFormModal'
import { EventActions } from './EventActions'
import { CalendarDays } from 'lucide-react'

export default async function ManageEventsPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const perms = await getMyPermissions(authUser.id)
  if (!perms.includes('MANAGE_EVENTS')) redirect('/dashboard')

  const events = await getEvents()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">إدارة الفعاليات</h1>
          <p className="text-white/40 text-sm">{events.length} فعالية</p>
        </div>
        <EventFormModal mode="create" />
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarDays size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">لا توجد فعاليات</p>
          <EventFormModal mode="create" />
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="glass-card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-medium truncate">{event.title}</p>
                  <Badge variant={event.date >= today ? 'orange' : 'gray'} size="sm">
                    {event.date >= today ? 'قادم' : 'منتهي'}
                  </Badge>
                </div>
                <p className="text-white/40 text-xs">
                  {formatDate(event.date)} · {formatTime(event.time)}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
              <EventActions event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
