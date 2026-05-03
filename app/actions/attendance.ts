'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getActiveAttendance(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('user_id', userId)
    .is('check_out', null)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

export async function checkIn(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const existing = await getActiveAttendance(user.id)
  if (existing) return { error: 'أنت محضر مسبقاً في المختبر' }

  const { data: log, error } = await supabase
    .from('attendance_logs')
    .insert({
      user_id: user.id,
      check_in: new Date().toISOString(),
      notes: (formData.get('notes') as string) || null,
    })
    .select()
    .single()

  if (error) return { error: 'حدث خطأ أثناء تسجيل الحضور' }

  revalidatePath('/dashboard/attendance')
  revalidatePath('/admin/attendance')
  return { success: true, logId: log.id }
}

export async function checkOut(attendanceLogId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { error } = await supabase
    .from('attendance_logs')
    .update({ check_out: new Date().toISOString() })
    .eq('id', attendanceLogId)
    .eq('user_id', user.id)

  if (error) return { error: 'حدث خطأ أثناء تسجيل المغادرة' }

  revalidatePath('/dashboard/attendance')
  revalidatePath('/admin/attendance')
  return { success: true }
}

export async function getMyAttendanceLogs() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('check_in', { ascending: false })
    .limit(30)

  return data ?? []
}

export async function getAllAttendanceLogs() {
  const supabase = createClient()
  const { data } = await supabase
    .from('attendance_logs')
    .select('*, users(full_name, email)')
    .order('check_in', { ascending: false })
    .limit(100)

  return data ?? []
}

export async function getTodayAttendanceCount() {
  const supabase = createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('attendance_logs')
    .select('*', { count: 'exact', head: true })
    .gte('check_in', today.toISOString())

  return count ?? 0
}
