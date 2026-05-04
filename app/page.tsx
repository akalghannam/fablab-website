import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { GlowBackground } from '@/components/GlowBackground'
import { EventCard } from '@/components/EventCard'
import { getUpcomingEvents } from '@/app/actions/events'
import { ArrowLeft, Zap, Users, CalendarCheck } from 'lucide-react'
import type { User } from '@/types'

export default async function HomePage() {
  let currentUser: User | null = null
  let upcomingEvents: Awaited<ReturnType<typeof getUpcomingEvents>> = []

  try {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      currentUser = data
    }
  } catch {
    // Supabase unavailable — render page without user session
  }

  try {
    upcomingEvents = await getUpcomingEvents(3)
  } catch {
    // Events unavailable — render page without events list
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser} />

      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center min-h-[85vh] overflow-hidden">
        <GlowBackground variant="hero" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/30 rounded-full px-4 py-1.5 text-brand-blue text-sm mb-8">
            <Zap size={14} />
            <span>منصة إدارة نادي فاب لاب</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            <span className="text-gradient-orange">FabLab</span>
            <br />
            <span className="text-white">نادي الإبداع</span>
          </h1>

          <p className="english-text text-brand-orange text-lg md:text-2xl font-sansation tracking-[0.3em] mb-4 uppercase">
            WE PLAN. WE FABRICATE
          </p>

          <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            مساحة للإبداع والتصنيع الرقمي والابتكار — سجّل حضورك، انضم للفعاليات، وشارك في بناء المستقبل
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events" className="btn-primary text-lg px-8 py-3.5">
              استعرض الفعاليات
            </Link>
            {!currentUser && (
              <Link href="/signup" className="btn-outline text-lg px-8 py-3.5">
                انضم إلينا
              </Link>
            )}
            {currentUser && (
              <Link href="/dashboard" className="btn-outline text-lg px-8 py-3.5">
                لوحة التحكم
              </Link>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2.5 bg-brand-blue rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-brand-darker/50">
        <div className="page-container">
          <h2 className="section-title text-center text-3xl mb-12">ما يمكنك فعله</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 text-center hover:bg-white/[0.07] transition-all group">
              <div className="w-14 h-14 bg-brand-blue/15 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-blue/25 transition-colors">
                <CalendarCheck size={26} className="text-brand-blue" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">الفعاليات</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                استعرض الفعاليات القادمة وسجّل حضورك بسهولة. ورش عمل، محاضرات، ومشاريع تعاونية.
              </p>
            </div>

            <div className="glass-card p-8 text-center hover:bg-white/[0.07] transition-all group">
              <div className="w-14 h-14 bg-brand-orange/15 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-orange/25 transition-colors">
                <Users size={26} className="text-brand-orange" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">تسجيل الحضور</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                سجّل دخولك وخروجك من المختبر، وتابع ساعات حضورك التراكمية بشكل منظم.
              </p>
            </div>

            <div className="glass-card p-8 text-center hover:bg-white/[0.07] transition-all group">
              <div className="w-14 h-14 bg-brand-blue/15 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-blue/25 transition-colors">
                <Zap size={26} className="text-brand-blue" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">حالة المختبر</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                وثّق حالة المختبر والأجهزة عند الدخول والخروج لضمان بيئة عمل مثالية للجميع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-20">
          <div className="page-container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-white">الفعاليات القادمة</h2>
              <Link href="/events"
                className="flex items-center gap-2 text-brand-blue hover:text-blue-400 transition-colors text-sm font-medium">
                عرض الكل
                <ArrowLeft size={16} className="rtl:rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!currentUser && (
        <section className="py-20 bg-brand-darker/30 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #4e97b7 0%, transparent 70%)', filter: 'blur(60px)' }} />
          </div>
          <div className="page-container relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              انضم إلى نادي فاب لاب
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              كن جزءاً من مجتمع المبدعين والمبتكرين. أنشئ حسابك اليوم وابدأ رحلتك.
            </p>
            <Link href="/signup" className="btn-primary text-lg px-10 py-4">
              إنشاء حساب مجاني
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
