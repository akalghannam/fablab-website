'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getMyPermissions } from './permissions'
import type { LabStatus, LabStatusValue } from '@/types'

export async function getCurrentLabStatus(): Promise<LabStatus | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('lab_status')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return data ?? { id: '', status: 'red', notes: null, changed_by: null, changed_at: new Date().toISOString() }
  } catch {
    return { id: '', status: 'red', notes: null, changed_by: null, changed_at: new Date().toISOString() }
  }
}

export async function setLabStatus(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: me } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!me?.is_super_admin) {
    const perms = await getMyPermissions(user.id)
    if (!perms.includes('CHANGE_LAB_STATUS')) return { error: 'غير مصرح' }
  }

  const status = formData.get('status') as LabStatusValue
  const notes = (formData.get('notes') as string) || null

  const { error } = await supabase.from('lab_status').insert({
    status,
    notes,
    changed_by: user.id,
    changed_at: new Date().toISOString(),
  })

  if (error) return { error: 'حدث خطأ أثناء تغيير الحالة' }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/lab-status-control')
  revalidatePath('/super-admin')
  return { success: true }
}
