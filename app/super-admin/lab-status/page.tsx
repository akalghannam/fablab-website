import { getCurrentLabStatus } from '@/app/actions/current-lab-status'
import { LabStatusDot } from '@/components/LabStatusDot'
import { LabStatusControlForm } from './LabStatusControlForm'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'

export default async function SuperAdminLabStatusPage() {
  const supabase = createClient()
  const current = await getCurrentLabStatus()

  // Last 10 status changes
  const { data: history } = await supabase
    .from('lab_status')
    .select('*, users(full_name)')
    .order('changed_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">حالة المقر</h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-white/40 text-sm">الحالة الحالية:</p>
          <LabStatusDot status={current?.status ?? 'red'} size="lg"
            notes={current?.notes ?? undefined} />
        </div>
      </div>

      <LabStatusControlForm />

      {/* History */}
      {history && history.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-white font-bold mb-4">سجل التغييرات</h2>
          <div className="space-y-3">
            {history.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <LabStatusDot status={h.status} size="sm" showLabel={false} />
                  <div>
                    <p className="text-white text-sm">{h.notes || '—'}</p>
                    <p className="text-white/30 text-xs">
                      {h.users?.full_name ?? 'نظام'} · {formatDateTime(h.changed_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
