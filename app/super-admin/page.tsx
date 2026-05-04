import { getDashboardStats } from '@/app/actions/admin'
import { getAllMembers } from '@/app/actions/members-management'
import { StatCard } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/utils'
import { Users, CalendarDays, ClipboardCheck, HardDrive, Trash2 } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60

export default async function SuperAdminPage() {
  const [stats, members] = await Promise.all([
    getDashboardStats(),
    getAllMembers(),
  ])

  const memberCount = members.filter(m => !m.is_super_admin).length
  const superAdminCount = members.filter(m => m.is_super_admin).length

  const nextCleanup = stats.lastCleanup
    ? new Date(new Date(stats.lastCleanup.cleaned_at).setMonth(
        new Date(stats.lastCleanup.cleaned_at).getMonth() + 1
      ))
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">الإحصائيات</h1>
        <p className="text-white/40 text-sm">نظرة عامة على نشاط النادي</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="الأعضاء" value={memberCount}
          icon={<Users size={22} />} accent="blue" />
        <StatCard title="الفعاليات القادمة" value={stats.upcomingEvents}
          icon={<CalendarDays size={22} />} accent="orange" />
        <StatCard title="حضور اليوم" value={stats.todayAttendance}
          icon={<ClipboardCheck size={22} />} accent="blue" />
        <StatCard title="داخل المختبر الآن" value={stats.openLabStatus}
          icon={<ClipboardCheck size={22} />} accent="orange"
          subtitle={stats.openLabStatus > 0 ? 'نشط' : 'لا أحد'} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/super-admin/members"
          className="glass-card p-5 hover:bg-white/[0.07] transition-all group flex items-center gap-3">
          <Users size={22} className="text-brand-orange group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-white font-medium text-sm">إدارة الأعضاء</p>
            <p className="text-white/40 text-xs">{memberCount} عضو</p>
          </div>
        </Link>
        <Link href="/super-admin/lab-status"
          className="glass-card p-5 hover:bg-white/[0.07] transition-all group flex items-center gap-3">
          <ClipboardCheck size={22} className="text-brand-blue group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-white font-medium text-sm">تغيير حالة المقر</p>
            <p className="text-white/40 text-xs">مفتوح / اجتماع / مغلق</p>
          </div>
        </Link>
      </div>

      {/* Storage info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive size={20} className="text-brand-blue" />
          <h2 className="text-white font-bold">إدارة التخزين</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 size={15} className="text-brand-orange" />
              <p className="text-white/50 text-sm">آخر تنظيف</p>
            </div>
            {stats.lastCleanup ? (
              <>
                <p className="text-white font-medium text-sm">{formatDateTime(stats.lastCleanup.cleaned_at)}</p>
                <p className="text-white/40 text-xs mt-1">
                  {stats.lastCleanup.files_deleted} ملف · {stats.lastCleanup.space_freed_mb.toFixed(1)} MB
                </p>
              </>
            ) : (
              <p className="text-white/40 text-sm">لم يُجرَ أي تنظيف</p>
            )}
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm mb-2">التنظيف القادم</p>
            <p className="text-white font-medium text-sm">
              {nextCleanup
                ? nextCleanup.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'في أول كل شهر'}
            </p>
            <p className="text-white/30 text-xs mt-1">الصور الأقدم من 30 يوم</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/50 text-sm mb-2">المشرفون العامون</p>
            <p className="text-white font-bold text-xl">{superAdminCount}</p>
            <p className="text-white/30 text-xs mt-1">رئيس + مطور</p>
          </div>
        </div>
      </div>
    </div>
  )
}
