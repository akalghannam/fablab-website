import { getAllMembers } from '@/app/actions/members-management'
import { getUserPermissions } from '@/app/actions/permissions'
import { Badge } from '@/components/ui/Badge'
import { PERMISSION_LABELS } from '@/types'
import { SuperMemberRow } from './SuperMemberRow'
import { CreateMemberModal } from '@/app/dashboard/manage-members/CreateMemberModal'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'

export default async function SuperAdminMembersPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const members = await getAllMembers()
  const regularMembers = members.filter(m => !m.is_super_admin)
  const superAdmins = members.filter(m => m.is_super_admin)

  const membersWithPerms = await Promise.all(
    regularMembers.map(async m => ({
      ...m,
      permissions: await getUserPermissions(m.id),
    }))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">الأعضاء</h1>
          <p className="text-white/40 text-sm">{regularMembers.length} عضو · {superAdmins.length} مشرف عام</p>
        </div>
        <CreateMemberModal granterId={authUser?.id ?? ''} />
      </div>

      {/* Super admins — read-only display */}
      {superAdmins.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="text-brand-orange font-bold mb-4 text-sm">المشرفون العامون (محميون)</h2>
          <div className="space-y-3">
            {superAdmins.map(sa => (
              <div key={sa.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{sa.full_name}</p>
                  <p className="text-white/40 text-xs english-text">{sa.email}</p>
                </div>
                <Badge variant="orange" size="sm">مشرف عام</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular members */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Users size={18} className="text-brand-blue" />
            الأعضاء ({regularMembers.length})
          </h2>
        </div>

        {membersWithPerms.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">لا يوجد أعضاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3 text-white/40 text-xs">
                  <th className="text-right py-3 px-4 font-medium">العضو</th>
                  <th className="text-right py-3 px-4 font-medium">الصلاحيات</th>
                  <th className="text-right py-3 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {membersWithPerms.map(member => (
                  <SuperMemberRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
