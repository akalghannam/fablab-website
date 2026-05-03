import { getDashboardStats } from '@/app/actions/admin'
import { StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { Users, CalendarDays, ClipboardCheck, FlaskConical, HardDrive, Trash2 } from 'lucide-react'

export const revalidate = 60

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const nextCleanup = stats.lastCleanup
    ? new Date(new Date(stats.lastCleanup.cleaned_at).setMonth(new Date(stats.lastCleanup.cleaned_at).getMonth() + 1))
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">لوحة الإدارة</h1>
        <p className="text-white/40 text-sm">نظرة عامة على نشاط النادي</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="الأعضاء الكلي"
          value={stats.totalMembers}
          icon={<Users size={22} />}
          accent="blue"
        />
        <StatCard
          title="الفعاليات القادمة"
          value={stats.upcomingEvents}
          icon={<CalendarDays size={22} />}
          accent="orange"
        />
        <StatCard
          title="حضور اليوم"
          value={stats.todayAttendance}
          icon={<ClipboardCheck size={22} />}
          accent="blue"
        />
        <StatCard
          title="داخل المختبر الآن"
          value={stats.openLabStatus}
          icon={<FlaskConical size={22} />}
          accent="orange"
          subtitle={stats.openLabStatus > 0 ? 'نشط' : 'لا أحد'}
        />
      </div>

      {/* Storage Management */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <HardDrive size={20} className="text-brand-blue" />
          <h2 className="text-white font-bold text-lg">إدارة التخزين</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 size={16} className="text-brand-orange" />
              <p className="text-white/50 text-sm">آخر تنظيف</p>
            </div>
            {stats.lastCleanup ? (
              <>
                <p className="text-white font-medium">{formatDateTime(stats.lastCleanup.cleaned_at)}</p>
                <p className="text-white/40 text-xs mt-1">
                  {stats.lastCleanup.files_deleted} ملف — {stats.lastCleanup.space_freed_mb.toFixed(1)} MB
                </p>
              </>
            ) : (
              <p className="text-white/40 text-sm">لم يُجرَ أي تنظيف</p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm mb-2">التنظيف القادم</p>
            {nextCleanup ? (
              <p className="text-white font-medium">
                {nextCleanup.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            ) : (
              <p className="text-white/40 text-sm">في أول كل شهر</p>
            )}
            <p className="text-white/30 text-xs mt-1">الصور الأقدم من 30 يوم</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm mb-2">السياسة</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="green" size="sm">آمن</Badge>
                <p className="text-white/60 text-xs">الصور الجديدة محمية</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="orange" size="sm">تلقائي</Badge>
                <p className="text-white/60 text-xs">كل أول الشهر</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/events', label: 'إدارة الفعاليات', icon: CalendarDays, color: 'text-brand-orange' },
          { href: '/admin/members', label: 'إدارة الأعضاء', icon: Users, color: 'text-brand-blue' },
          { href: '/admin/attendance', label: 'سجلات الحضور', icon: ClipboardCheck, color: 'text-brand-blue' },
          { href: '/admin/lab-status', label: 'تقارير المختبر', icon: FlaskConical, color: 'text-brand-orange' },
        ].map(({ href, label, icon: Icon, color }) => (
          <a key={href} href={href}
            className="glass-card p-4 hover:bg-white/[0.07] transition-all group text-center">
            <Icon size={24} className={`${color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
            <p className="text-white/70 text-sm">{label}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
