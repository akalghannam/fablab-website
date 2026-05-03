import { getAllLabStatusReports } from '@/app/actions/lab-status'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, equipmentConditionLabel, cleanlinessLabel } from '@/lib/utils'
import { FlaskConical, Camera } from 'lucide-react'
import Image from 'next/image'

export default async function AdminLabStatusPage() {
  const reports = await getAllLabStatusReports()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">تقارير حالة المختبر</h1>
        <p className="text-white/40 text-sm">{reports.length} تقرير إجمالاً</p>
      </div>

      {reports.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FlaskConical size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40">لا توجد تقارير بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium">
                      {(report as any).users?.full_name ?? 'عضو'}
                    </p>
                    <Badge variant={report.type === 'check-in' ? 'blue' : 'orange'} size="sm">
                      {report.type === 'check-in' ? 'دخول' : 'خروج'}
                    </Badge>
                  </div>
                  <p className="text-white/40 text-xs">{(report as any).users?.email}</p>
                  <p className="text-white/30 text-xs mt-0.5">{formatDateTime(report.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                {report.equipment_condition && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs mb-1">حالة الأجهزة</p>
                    <p className="text-white font-medium">{equipmentConditionLabel(report.equipment_condition)}</p>
                  </div>
                )}
                {report.cleanliness_rating && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-xs mb-1">النظافة</p>
                    <p className="text-white font-medium">{report.cleanliness_rating}/5</p>
                    <p className="text-white/40 text-xs">{cleanlinessLabel(report.cleanliness_rating)}</p>
                  </div>
                )}
              </div>

              {report.notes && (
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-white/60 text-sm">{report.notes}</p>
                </div>
              )}

              {report.photos && report.photos.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-2 flex items-center gap-1">
                    <Camera size={12} />
                    الصور ({report.photos.length})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {report.photos.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 hover:border-brand-blue/50 transition-colors">
                          <Image src={url} alt={`صورة ${i + 1}`} fill className="object-cover" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
