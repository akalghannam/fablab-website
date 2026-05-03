'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMembers() {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function updateMemberStatus(userId: string, isActive: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) return { error: 'حدث خطأ أثناء تحديث الحالة' }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function updateMemberRole(userId: string, role: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: 'حدث خطأ أثناء تحديث الدور' }

  revalidatePath('/admin/members')
  return { success: true }
}

export async function getDashboardStats() {
  const supabase = createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [membersRes, eventsRes, attendanceRes, openLabRes] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0]),
    supabase.from('attendance_logs').select('*', { count: 'exact', head: true })
      .gte('check_in', today.toISOString())
      .lt('check_in', tomorrow.toISOString()),
    supabase.from('attendance_logs').select('*', { count: 'exact', head: true })
      .is('check_out', null),
  ])

  const { data: lastCleanup } = await supabase
    .from('storage_cleanup_logs')
    .select('*')
    .order('cleaned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    totalMembers: membersRes.count ?? 0,
    upcomingEvents: eventsRes.count ?? 0,
    todayAttendance: attendanceRes.count ?? 0,
    openLabStatus: openLabRes.count ?? 0,
    lastCleanup,
  }
}

export async function exportEventRegistrations(eventId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: true })

  return data ?? []
}
