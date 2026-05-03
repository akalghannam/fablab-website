import { getMembers } from '@/app/actions/admin'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import { Users } from 'lucide-react'
import { MemberActions } from './MemberActions'

export default async function AdminMembersPage() {
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">الأعضاء</h1>
          <p className="text-white/40 text-sm">{members.length} عضو مسجّل</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">لا يوجد أعضاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3 text-white/40 text-xs">
                  <th className="text-right py-3 px-4 font-medium">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 font-medium">الجوال</th>
                  <th className="text-right py-3 px-4 font-medium">الدور</th>
                  <th className="text-right py-3 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium">تاريخ الانضمام</th>
                  <th className="text-right py-3 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{member.full_name ?? 'غير محدد'}</p>
                    </td>
                    <td className="py-3 px-4 text-white/60 english-text text-xs">{member.email}</td>
                    <td className="py-3 px-4 text-white/60 english-text">{member.phone ?? '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={member.role === 'admin' ? 'orange' : 'blue'} size="sm">
                        {member.role === 'admin' ? 'مدير' : member.role === 'member' ? 'عضو' : 'زائر'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={member.is_active ? 'green' : 'red'} size="sm">
                        {member.is_active ? 'نشط' : 'معطّل'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-white/40 text-xs">{formatDateTime(member.created_at)}</td>
                    <td className="py-3 px-4">
                      <MemberActions
                        userId={member.id}
                        isActive={member.is_active}
                        currentRole={member.role}
                      />
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
