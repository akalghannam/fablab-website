'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getMyPermissions, setMemberPermissions } from './permissions'
import type { Permission } from '@/types'

async function assertCanManageMembers() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح', user: null }

  const { data: me } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_super_admin) {
    const perms = await getMyPermissions(user.id)
    if (!perms.includes('CREATE_MEMBERS')) return { error: 'غير مصرح', user: null }
  }

  return { error: null, user }
}

export async function createMember(formData: FormData) {
  const { error: authErr, user } = await assertCanManageMembers()
  if (authErr || !user) return { error: authErr ?? 'غير مصرح' }

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const username = (formData.get('username') as string) || null
  const permissions = formData.getAll('permissions') as Permission[]

  const adminClient = createAdminClient()

  const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, account_type: 'member' },
  })

  if (createErr) {
    if (createErr.message.includes('already')) return { error: 'هذا البريد الإلكتروني مستخدم مسبقاً' }
    return { error: 'حدث خطأ أثناء إنشاء الحساب' }
  }

  const uid = newUser.user.id

  await adminClient.from('users').upsert({
    id: uid,
    email,
    full_name: fullName,
    username,
    account_type: 'member',
    role: 'member',
    is_active: true,
  })

  if (permissions.length > 0) {
    await adminClient.from('member_permissions').insert(
      permissions.map(p => ({ user_id: uid, permission: p, granted_by: user.id }))
    )
  }

  revalidatePath('/super-admin/members')
  revalidatePath('/dashboard/manage-members')
  return { success: true }
}

export async function updateMember(userId: string, formData: FormData) {
  const { error: authErr } = await assertCanManageMembers()
  if (authErr) return { error: authErr }

  const adminClient = createAdminClient()

  // Protect super admins from being edited by non-super-admins
  const supabase = createClient()
  const { data: target } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', userId)
    .single()

  if (target?.is_super_admin) return { error: 'لا يمكن تعديل حسابات المشرفين' }

  const email    = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const username = (formData.get('username') as string) || null
  const password = formData.get('password') as string

  const authUpdate: Record<string, string> = { email }
  if (password) authUpdate.password = password

  const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, authUpdate)
  if (updateErr) return { error: 'حدث خطأ أثناء تحديث البيانات' }

  await adminClient.from('users').update({ email, full_name: fullName, username }).eq('id', userId)

  const permissions = formData.getAll('permissions') as Permission[]
  await setMemberPermissions(userId, permissions)

  revalidatePath('/super-admin/members')
  revalidatePath('/dashboard/manage-members')
  return { success: true }
}

export async function deleteMember(userId: string) {
  const { error: authErr } = await assertCanManageMembers()
  if (authErr) return { error: authErr }

  const supabase = createClient()
  const { data: target } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', userId)
    .single()

  if (target?.is_super_admin) return { error: 'لا يمكن حذف حسابات المشرفين' }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { error: 'حدث خطأ أثناء حذف الحساب' }

  revalidatePath('/super-admin/members')
  revalidatePath('/dashboard/manage-members')
  return { success: true }
}

export async function getAllMembers() {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .in('account_type', ['member', 'super_admin'])
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getAudienceRegistrants() {
  const supabase = createClient()
  const { data } = await supabase
    .from('event_registrations')
    .select('*, events(title, date)')
    .order('registered_at', { ascending: false })

  return data ?? []
}
