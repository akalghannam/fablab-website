'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLabStatusReport(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const photosRaw = formData.get('photos') as string
  const photos = photosRaw ? JSON.parse(photosRaw) : null

  const { error } = await supabase.from('lab_status_reports').insert({
    user_id: user.id,
    attendance_log_id: (formData.get('attendance_log_id') as string) || null,
    type: formData.get('type') as string,
    equipment_condition: (formData.get('equipment_condition') as string) || null,
    cleanliness_rating: formData.get('cleanliness_rating')
      ? parseInt(formData.get('cleanliness_rating') as string)
      : null,
    notes: (formData.get('notes') as string) || null,
    photos: photos,
  })

  if (error) return { error: 'حدث خطأ أثناء حفظ تقرير المختبر' }

  revalidatePath('/dashboard/lab-status')
  revalidatePath('/admin/lab-status')
  return { success: true }
}

export async function getMyLabStatusReports() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('lab_status_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function getAllLabStatusReports() {
  const supabase = createClient()
  const { data } = await supabase
    .from('lab_status_reports')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return data ?? []
}

export async function getOpenLabStatus() {
  const supabase = createClient()
  const { count } = await supabase
    .from('attendance_logs')
    .select('*', { count: 'exact', head: true })
    .is('check_out', null)

  return count ?? 0
}

export async function getLastCleanupLog() {
  const supabase = createClient()
  const { data } = await supabase
    .from('storage_cleanup_logs')
    .select('*')
    .order('cleaned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}
