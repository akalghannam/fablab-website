import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEvent, getEventRegistrations } from '@/app/actions/events'
import { formatDate, formatTime, formatDateTime } from '@/lib/utils'
import { ArrowRight, Download, Users, Calendar, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ExportButton } from './ExportButton'

interface Props {
  params: { id: string }
}

export default async function EventDetailAdminPage({ params }: Props) {
  const [event, registrations] = await Promise.all([
    getEvent(params.id),
    getEventRegistrations(params.id),
  ])

  if (!event) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/events"
          className="text-white/40 hover:text-brand-blue transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <p className="text-white/40 text-sm">قائمة المسجلين</p>
        </div>
      </div>

      {/* Event info */}
      <div className="glass-card p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Calendar size={15} className="text-brand-blue" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Clock size={15} className="text-brand-blue" />
            {formatTime(event.time)}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-white/60">
              <MapPin size={15} className="text-brand-orange" />
              {event.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-white/60">
            <Users size={15} className="text-brand-blue" />
            {registrations.length}{event.capacity ? ` / ${event.capacity}` : ''} مسجّل
          </div>
        </div>
      </div>

      {/* Registrations */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Users size={18} className="text-brand-blue" />
            المسجلون ({registrations.length})
          </h2>
          {registrations.length > 0 && (
            <ExportButton eventId={event.id} eventTitle={event.title} />
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">لا يوجد مسجلون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/3 border-b border-white/10 text-white/40 text-xs">
                  <th className="text-right py-3 px-4 font-medium">#</th>
                  <th className="text-right py-3 px-4 font-medium">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 font-medium">الجوال</th>
                  <th className="text-right py-3 px-4 font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, i) => (
                  <tr key={reg.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4 text-white/30">{i + 1}</td>
                    <td className="py-3 px-4 text-white font-medium">{reg.name}</td>
                    <td className="py-3 px-4 text-white/60 english-text">{reg.email}</td>
                    <td className="py-3 px-4 text-white/60 english-text">{reg.phone ?? '—'}</td>
                    <td className="py-3 px-4 text-white/40 text-xs">{formatDateTime(reg.registered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
