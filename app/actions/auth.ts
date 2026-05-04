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
    .select('role, is_super_admin, account_type')
    .eq('id', user.id)
    .single()

  revalidatePath('/', 'layout')

  if (userData?.is_super_admin) return { redirectTo: '/super-admin' }
  if (userData?.role === 'admin')  return { redirectTo: '/admin' }
  if (userData?.account_type === 'member') return { redirectTo: '/dashboard' }

  // Audience accounts land on home — they have no member portal
  return { redirectTo: '/' }
}

export async function signUp(formData: FormData) {
  const supabase = createClient()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone    = formData.get('phone') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { full_name: fullName, account_type: 'audience' },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'هذا البريد الإلكتروني مسجل مسبقاً' }
    }
    return { error: 'حدث خطأ أثناء إنشاء الحساب' }
  }

  if (data.user) {
    await supabase.from('users').upsert({
      id: data.user.id,
      email,
      full_name: fullName || null,
      phone: phone || null,
      account_type: 'audience',
      role: 'guest',
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
