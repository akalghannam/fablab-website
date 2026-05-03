import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { Badge } from './ui/Badge'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
  showActions?: boolean
}

export function EventCard({ event, showActions = true }: EventCardProps) {
  const isPast = new Date(event.date) < new Date()

  return (
    <div className="glass-card overflow-hidden hover:bg-white/[0.07] transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-brand-blue/20 to-brand-orange/10 overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/10 text-7xl font-sansation english-text select-none">FL</div>
          </div>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="gray" size="md">منتهي</Badge>
          </div>
        )}
        {!isPast && (
          <div className="absolute top-3 right-3">
            <Badge variant="orange" size="md">قادم</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 leading-snug">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-white/60 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-blue flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-brand-blue flex-shrink-0" />
            <span>{formatTime(event.time)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-orange flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users size={14} className="text-brand-blue flex-shrink-0" />
              <span>السعة: {event.capacity} مقعد</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-white/40 text-sm line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>
        )}

        {showActions && !isPast && (
          <Link
            href={`/events/${event.id}`}
            className="btn-primary text-sm py-2 w-full text-center block"
          >
            التفاصيل والتسجيل
          </Link>
        )}
        {showActions && isPast && (
          <Link
            href={`/events/${event.id}`}
            className="btn-outline text-sm py-2 w-full text-center block"
          >
            عرض التفاصيل
          </Link>
        )}
      </div>
    </div>
  )
}
