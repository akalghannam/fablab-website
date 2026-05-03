'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getEvents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) return []
  return data
}

export async function getUpcomingEvents(limit = 3) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  return data ?? []
}

export async function getEvent(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getEventRegistrations(eventId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false })

  return data ?? []
}

export async function createEvent(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { error } = await supabase.from('events').insert({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    location: (formData.get('location') as string) || null,
    capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
    image_url: (formData.get('image_url') as string) || null,
    created_by: user.id,
  })

  if (error) return { error: 'حدث خطأ أثناء إنشاء الفعالية' }

  revalidatePath('/events')
  revalidatePath('/admin/events')
  return { success: true }
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase
    .from('events')
    .update({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      location: (formData.get('location') as string) || null,
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
      image_url: (formData.get('image_url') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: 'حدث خطأ أثناء تحديث الفعالية' }

  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
  revalidatePath('/admin/events')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { error: 'حدث خطأ أثناء حذف الفعالية' }

  revalidatePath('/events')
  revalidatePath('/admin/events')
  redirect('/admin/events')
}

export async function registerForEvent(formData: FormData) {
  const supabase = createClient()
  const eventId = formData.get('event_id') as string

  const { error } = await supabase.from('event_registrations').insert({
    event_id: eventId,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || null,
  })

  if (error) {
    if (error.message.includes('duplicate')) {
      return { error: 'هذا البريد الإلكتروني مسجل مسبقاً في هذه الفعالية' }
    }
    return { error: 'حدث خطأ أثناء التسجيل' }
  }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}
