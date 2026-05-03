import { createClient } from '@/lib/supabase/server'
import { getActiveAttendance, getMyAttendanceLogs } from '@/app/actions/attendance'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, calculateDuration } from '@/lib/utils'
import { AttendanceControls } from './AttendanceControls'
import { ClipboardCheck } from 'lucide-react'

export default async function AttendancePage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const [activeLog, logs] = await Promise.all([
    getActiveAttendance(authUser.id),
    getMyAttendanceLogs(),
  ])

  const totalHoursMs = logs
    .filter(l => l.check_out)
    .reduce((acc, l) => acc + (new Date(l.check_out!).getTime() - new Date(l.check_in).getTime()), 0)
  const totalHours = Math.round(totalHoursMs / (1000 * 60 * 60) * 10) / 10

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">تسجيل الحضور</h1>
        <p className="text-white/40 text-sm">
          إجمالي ساعات الحضور: <span className="text-brand-blue font-medium">{totalHours} ساعة</span>
        </p>
      </div>

      {/* Attendance controls (check in / check out) */}
      <AttendanceControls activeLog={activeLog} userId={authUser.id} />

      {/* History */}
      <div className="glass-card p-6">
        <h2 className="text-white font-bold mb-5 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-brand-blue" />
          سجل الحضور الكامل
        </h2>

        {logs.length === 0 ? (
          <p className="text-white/30 text-center py-10">لا يوجد سجل حضور</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-xs">
                  <th className="text-right py-3 px-2 font-medium">وقت الدخول</th>
                  <th className="text-right py-3 px-2 font-medium">وقت الخروج</th>
                  <th className="text-right py-3 px-2 font-medium">المدة</th>
                  <th className="text-right py-3 px-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-2 text-white">{formatDateTime(log.check_in)}</td>
                    <td className="py-3 px-2 text-white/60">
                      {log.check_out ? formatDateTime(log.check_out) : '—'}
                    </td>
                    <td className="py-3 px-2 text-white/60">
                      {log.check_out ? calculateDuration(log.check_in, log.check_out) : '—'}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={log.check_out ? 'green' : 'orange'} size="sm">
                        {log.check_out ? 'مكتمل' : 'نشط ●'}
                      </Badge>
                    </td>
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
