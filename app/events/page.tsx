import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { GlowBackground } from '@/components/GlowBackground'
import { EventCard } from '@/components/EventCard'
import { getEvents } from '@/app/actions/events'
import { Calendar } from 'lucide-react'
import type { User } from '@/types'

export const revalidate = 60

export default async function EventsPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let currentUser: User | null = null
  if (authUser) {
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    currentUser = data
  }

  const events = await getEvents()
  const today = new Date().toISOString().split('T')[0]
  const upcoming = events.filter(e => e.date >= today)
  const past = events.filter(e => e.date < today)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser} />
      <GlowBackground />

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <div className="bg-brand-darker/40 border-b border-white/10 py-12">
          <div className="page-container">
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={28} className="text-brand-orange" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">الفعاليات</h1>
            </div>
            <p className="text-white/50 text-lg">
              استعرض جميع فعاليات نادي فاب لاب وسجّل حضورك
            </p>
          </div>
        </div>

        <div className="page-container py-10">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-14">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-orange rounded-full" />
                الفعاليات القادمة
                <span className="bg-brand-orange/15 text-brand-orange text-xs px-2 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white/60 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-white/20 rounded-full" />
                الفعاليات السابقة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="text-center py-24">
              <Calendar size={48} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-white/40 text-xl font-medium">لا توجد فعاليات حالياً</h3>
              <p className="text-white/25 text-sm mt-2">تابع الصفحة للاطلاع على الفعاليات القادمة</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
