'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'حدث خطأ أثناء تسجيل الدخول' }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')
  return { role: userData?.role ?? 'member' }
}

export async function signUp(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'هذا البريد الإلكتروني مسجل مسبقاً' }
    }
    return { error: 'حدث خطأ أثناء إنشاء الحساب' }
  }

  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      full_name: fullName || null,
      phone: phone || null,
      role: 'member',
    })
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) return { error: 'حدث خطأ. تحقق من البريد الإلكتروني وحاول مجدداً.' }
  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'حدث خطأ أثناء تغيير كلمة المرور' }

  revalidatePath('/', 'layout')
  return { success: true }
}
