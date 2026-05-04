import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PermissionCard } from '@/components/PermissionCard'
import { getMyAttendanceLogs, getActiveAttendance } from '@/app/actions/attendance'
import { getMyPermissions } from '@/app/actions/permissions'
import { formatDateTime, calculateDuration } from '@/lib/utils'
import { ClipboardCheck, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Permission } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const [activeLog, attendanceLogs, permissions] = await Promise.all([
    getActiveAttendance(authUser.id),
    getMyAttendanceLogs(),
    getMyPermissions(authUser.id),
  ])

  const totalHoursMs = attendanceLogs
    .filter(l => l.check_out)
    .reduce((acc, l) => acc + (new Date(l.check_out!).getTime() - new Date(l.check_in).getTime()), 0)
  const totalHours   = Math.floor(totalHoursMs / (1000 * 60 * 60))
  const completedSessions = attendanceLogs.filter(l => l.check_out).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">نظرة عامة</h1>
        <p className="text-white/40 text-sm">مرحباً بك في لوحة التحكم</p>
      </div>

      {/* Active session banner */}
      {activeLog && (
        <div className="glass-card p-5 border-glow-orange flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <div>
              <p className="text-white font-medium">أنت حالياً في المختبر</p>
              <p className="text-white/40 text-sm">دخلت: {formatDateTime(activeLog.check_in)}</p>
            </div>
          </div>
          <Link href="/dashboard/attendance" className="btn-primary text-sm py-2">
            تسجيل الخروج
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="إجمالي ساعات الحضور" value={`${totalHours}س`}
          icon={<Clock size={22} />} accent="blue" />
        <StatCard title="الجلسات المكتملة" value={completedSessions}
          icon={<CheckCircle size={22} />} accent="orange" />
        <StatCard title="إجمالي التسجيلات" value={attendanceLogs.length}
          icon={<ClipboardCheck size={22} />} accent="blue" />
      </div>

      {/* Permission cards */}
      {permissions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-brand-orange rounded-full" />
            صلاحياتي
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map(perm => (
              <PermissionCard key={perm} permission={perm as Permission} />
            ))}
          </div>
        </div>
      )}

      {/* Recent attendance */}
      <div className="glass-card p-6">
        <h2 className="text-white font-bold mb-5 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-brand-blue" />
          آخر تسجيلات الحضور
        </h2>
        {attendanceLogs.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">لا يوجد سجل حضور بعد</p>
        ) : (
          <div className="space-y-3">
            {attendanceLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{formatDateTime(log.check_in)}</p>
                  {log.check_out && (
                    <p className="text-white/40 text-xs mt-0.5">
                      خروج: {formatDateTime(log.check_out)} · {calculateDuration(log.check_in, log.check_out)}
                    </p>
                  )}
                </div>
                <Badge variant={log.check_out ? 'green' : 'orange'} size="sm">
                  {log.check_out ? 'مكتمل' : 'نشط'}
                </Badge>
              </div>
            ))}
          </div>
        )}
        {attendanceLogs.length > 5 && (
          <Link href="/dashboard/attendance"
            className="block text-center text-brand-blue text-sm mt-4 hover:text-blue-400 transition-colors">
            عرض جميع السجلات
          </Link>
        )}
      </div>
    </div>
  )
}
