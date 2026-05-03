import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { GlowBackground } from '@/components/GlowBackground'
import { Badge } from '@/components/ui/Badge'
import { getEvent, getEventRegistrations } from '@/app/actions/events'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react'
import { EventRegistrationForm } from './RegistrationForm'
import type { User } from '@/types'

interface Props {
  params: { id: string }
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let currentUser: User | null = null
  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    currentUser = data
  }

  const event = await getEvent(params.id)
  if (!event) notFound()

  const registrations = await getEventRegistrations(params.id)
  const isPast = new Date(event.date) < new Date()
  const isFull = event.capacity ? registrations.length >= event.capacity : false

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser} />
      <GlowBackground />

      <main className="flex-1 relative z-10">
        <div className="page-container py-8">
          <Link href="/events"
            className="flex items-center gap-2 text-white/40 hover:text-brand-blue transition-colors text-sm mb-6">
            <ArrowRight size={15} />
            العودة إلى الفعاليات
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Image */}
              {event.image_url ? (
                <div className="relative h-72 rounded-2xl overflow-hidden mb-6">
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-brand-blue/20 to-brand-orange/10 rounded-2xl mb-6 flex items-center justify-center">
                  <span className="english-text font-sansation text-6xl text-white/10 font-bold">FL</span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <Badge variant={isPast ? 'gray' : 'orange'} size="md">
                  {isPast ? 'منتهي' : 'قادم'}
                </Badge>
                {isFull && !isPast && (
                  <Badge variant="red" size="md">اكتملت المقاعد</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-5 leading-snug">{event.title}</h1>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2.5 text-white/60 text-sm">
                  <Calendar size={16} className="text-brand-blue flex-shrink-0" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/60 text-sm">
                  <Clock size={16} className="text-brand-blue flex-shrink-0" />
                  <span>{formatTime(event.time)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2.5 text-white/60 text-sm col-span-2">
                    <MapPin size={16} className="text-brand-orange flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.capacity && (
                  <div className="flex items-center gap-2.5 text-white/60 text-sm">
                    <Users size={16} className="text-brand-blue flex-shrink-0" />
                    <span>{registrations.length} / {event.capacity} مسجّل</span>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="glass-card p-6">
                  <h2 className="text-white font-bold mb-3 text-lg">عن الفعالية</h2>
                  <p className="text-white/60 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Registration sidebar */}
            <div className="lg:col-span-2">
              {!isPast && !isFull && (
                <EventRegistrationForm eventId={event.id} />
              )}
              {isPast && (
                <div className="glass-card p-6 text-center">
                  <p className="text-white/50">هذه الفعالية قد انتهت</p>
                </div>
              )}
              {!isPast && isFull && (
                <div className="glass-card p-6 text-center">
                  <p className="text-white/50">اكتملت المقاعد لهذه الفعالية</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
