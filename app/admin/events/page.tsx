import Link from 'next/link'
import { getEvents } from '@/app/actions/events'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils'
import { Plus, Calendar, Edit } from 'lucide-react'
import { DeleteEventButton } from './DeleteEventButton'

export default async function AdminEventsPage() {
  const events = await getEvents()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">الفعاليات</h1>
          <p className="text-white/40 text-sm">{events.length} فعالية إجمالاً</p>
        </div>
        <Link href="/admin/events/new">
          <Button variant="primary" size="sm">
            <Plus size={16} />
            إضافة فعالية
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">لا توجد فعاليات</p>
          <Link href="/admin/events/new">
            <Button variant="primary">إضافة فعالية جديدة</Button>
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-right py-3 px-4 font-medium text-white/50">العنوان</th>
                  <th className="text-right py-3 px-4 font-medium text-white/50">التاريخ</th>
                  <th className="text-right py-3 px-4 font-medium text-white/50">الوقت</th>
                  <th className="text-right py-3 px-4 font-medium text-white/50">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium text-white/50">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{event.title}</p>
                      {event.location && (
                        <p className="text-white/40 text-xs mt-0.5">{event.location}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/70">{formatDate(event.date)}</td>
                    <td className="py-3 px-4 text-white/70">{formatTime(event.time)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={event.date >= today ? 'orange' : 'gray'} size="sm">
                        {event.date >= today ? 'قادم' : 'منتهي'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit size={14} />
                            تعديل
                          </Button>
                        </Link>
                        <Link href={`/admin/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            المسجلون
                          </Button>
                        </Link>
                        <DeleteEventButton eventId={event.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
