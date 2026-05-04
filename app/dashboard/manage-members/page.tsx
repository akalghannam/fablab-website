import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMyPermissions, getUserPermissions } from '@/app/actions/permissions'
import { getAllMembers } from '@/app/actions/members-management'
import { Badge } from '@/components/ui/Badge'
import { PERMISSION_LABELS } from '@/types'
import { CreateMemberModal } from './CreateMemberModal'
import { MemberRow } from './MemberRow'
import { Users, Plus } from 'lucide-react'

export default async function ManageMembersPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const perms = await getMyPermissions(authUser.id)
  if (!perms.includes('CREATE_MEMBERS')) redirect('/dashboard')

  const members = await getAllMembers()

  // Fetch permissions for each member
  const membersWithPerms = await Promise.all(
    members
      .filter(m => !m.is_super_admin)
      .map(async m => ({
        ...m,
        permissions: await getUserPermissions(m.id),
      }))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">إدارة الأعضاء</h1>
          <p className="text-white/40 text-sm">{membersWithPerms.length} عضو</p>
        </div>
        <CreateMemberModal granterId={authUser.id} />
      </div>

      <div className="glass-card overflow-hidden">
        {membersWithPerms.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">لا يوجد أعضاء بعد</p>
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
                  <MemberRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
