import { getAllAttendanceLogs } from '@/app/actions/attendance'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, calculateDuration } from '@/lib/utils'
import { ClipboardCheck } from 'lucide-react'

export default async function AdminAttendancePage() {
  const logs = await getAllAttendanceLogs()

  const activeLogs = logs.filter(l => !l.check_out)
  const completedLogs = logs.filter(l => l.check_out)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">سجلات الحضور</h1>
        <div className="flex gap-4 text-sm text-white/40">
          <span>الكلي: <span className="text-brand-blue font-medium">{logs.length}</span></span>
          <span>نشط الآن: <span className="text-emerald-400 font-medium">{activeLogs.length}</span></span>
          <span>مكتمل: <span className="text-white/60 font-medium">{completedLogs.length}</span></span>
        </div>
      </div>

      {/* Active sessions */}
      {activeLogs.length > 0 && (
        <div className="glass-card p-5 border-glow-blue">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            داخل المختبر الآن ({activeLogs.length})
          </h2>
          <div className="space-y-3">
            {activeLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-white font-medium">
                    {(log as any).users?.full_name ?? 'مستخدم'}
                  </p>
                  <p className="text-white/40 text-xs">{(log as any).users?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">{formatDateTime(log.check_in)}</p>
                  <Badge variant="green" size="sm">نشط</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All logs table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-white font-bold flex items-center gap-2">
            <ClipboardCheck size={18} className="text-brand-blue" />
            جميع السجلات
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">لا توجد سجلات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3 text-white/40 text-xs">
                  <th className="text-right py-3 px-4 font-medium">العضو</th>
                  <th className="text-right py-3 px-4 font-medium">وقت الدخول</th>
                  <th className="text-right py-3 px-4 font-medium">وقت الخروج</th>
                  <th className="text-right py-3 px-4 font-medium">المدة</th>
                  <th className="text-right py-3 px-4 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{(log as any).users?.full_name ?? '—'}</p>
                      <p className="text-white/40 text-xs">{(log as any).users?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-white/70 text-xs">{formatDateTime(log.check_in)}</td>
                    <td className="py-3 px-4 text-white/70 text-xs">
                      {log.check_out ? formatDateTime(log.check_out) : '—'}
                    </td>
                    <td className="py-3 px-4 text-white/60">
                      {log.check_out ? calculateDuration(log.check_in, log.check_out) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={log.check_out ? 'green' : 'orange'} size="sm">
                        {log.check_out ? 'مكتمل' : 'نشط'}
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
