'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Permission } from '@/types'

export async function getMyPermissions(userId: string): Promise<Permission[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('member_permissions')
    .select('permission')
    .eq('user_id', userId)

  return (data?.map(d => d.permission) ?? []) as Permission[]
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('member_permissions')
    .select('permission')
    .eq('user_id', userId)

  return (data?.map(d => d.permission) ?? []) as Permission[]
}

export async function grantPermission(userId: string, permission: Permission) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: me } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_super_admin) {
    const myPerms = await getMyPermissions(user.id)
    if (!myPerms.includes('CREATE_MEMBERS')) return { error: 'غير مصرح' }
  }

  const { error } = await supabase.from('member_permissions').upsert({
    user_id: userId,
    permission,
    granted_by: user.id,
  }, { onConflict: 'user_id,permission' })

  if (error) return { error: 'حدث خطأ أثناء منح الصلاحية' }

  revalidatePath('/super-admin/members')
  revalidatePath('/dashboard/manage-members')
  return { success: true }
}

export async function revokePermission(userId: string, permission: Permission) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: me } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_super_admin) {
    const myPerms = await getMyPermissions(user.id)
    if (!myPerms.includes('CREATE_MEMBERS')) return { error: 'غير مصرح' }
  }

  const { error } = await supabase
    .from('member_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission', permission)

  if (error) return { error: 'حدث خطأ أثناء سحب الصلاحية' }

  revalidatePath('/super-admin/members')
  revalidatePath('/dashboard/manage-members')
  return { success: true }
}

export async function setMemberPermissions(userId: string, permissions: Permission[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  // Delete existing then insert new
  await supabase.from('member_permissions').delete().eq('user_id', userId)

  if (permissions.length > 0) {
    const { error } = await supabase.from('member_permissions').insert(
      permissions.map(p => ({
        user_id: userId,
        permission: p,
        granted_by: user.id,
      }))
    )
    if (error) return { error: 'حدث خطأ أثناء تحديث الصلاحيات' }
  }

  revalidatePath('/super-admin/members')
  revalidatePath('/dashboard/manage-members')
  return { success: true }
}
