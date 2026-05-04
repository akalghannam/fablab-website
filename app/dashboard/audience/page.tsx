import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyPermissions } from '@/app/actions/permissions'
import { getAudienceRegistrants } from '@/app/actions/members-management'
import { formatDateTime } from '@/lib/utils'
import { UsersRound, Download } from 'lucide-react'
import { ExportAudienceButton } from './ExportAudienceButton'

export default async function AudiencePage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const perms = await getMyPermissions(authUser.id)
  if (!perms.includes('VIEW_AUDIENCE')) redirect('/dashboard')

  const registrants = await getAudienceRegistrants()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">بيانات الجماهير</h1>
          <p className="text-white/40 text-sm">{registrants.length} مسجّل</p>
        </div>
        {registrants.length > 0 && <ExportAudienceButton registrants={registrants} />}
      </div>

      <div className="glass-card overflow-hidden">
        {registrants.length === 0 ? (
          <div className="p-12 text-center">
            <UsersRound size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">لا يوجد مسجلون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3 text-white/40 text-xs">
                  <th className="text-right py-3 px-4 font-medium">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 font-medium">الجوال</th>
                  <th className="text-right py-3 px-4 font-medium">الفعالية</th>
                  <th className="text-right py-3 px-4 font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {registrants.map(r => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{r.name}</td>
                    <td className="py-3 px-4 text-white/60 english-text text-xs">{r.email}</td>
                    <td className="py-3 px-4 text-white/60 english-text">{r.phone ?? '—'}</td>
                    <td className="py-3 px-4 text-white/60 text-xs">
                      {(r as any).events?.title ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-white/40 text-xs">{formatDateTime(r.registered_at)}</td>
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
