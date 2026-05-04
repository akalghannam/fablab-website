'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { GlowBackground } from '@/components/GlowBackground'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUp } from '@/app/actions/auth'
import { CheckCircle, Eye, EyeOff, Info } from 'lucide-react'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm  = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      setLoading(false)
      return
    }

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-brand-dark">
        <GlowBackground variant="auth" />
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="glass-card p-8 md:p-10 text-center">
            <CheckCircle size={60} className="text-emerald-400 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-white mb-3">تم إنشاء الحساب!</h2>
            <p className="text-white/50 mb-6 leading-relaxed">
              تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى تفعيل حسابك للمتابعة.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              الذهاب إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-brand-dark py-10">
      <GlowBackground variant="auth" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8 md:p-10">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Logo width={150} height={52} />
            <span className="english-text text-brand-orange text-xs tracking-[0.25em] font-sansation">
              WE PLAN. WE FABRICATE
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">إنشاء حساب</h1>
          <p className="text-white/40 text-sm text-center mb-4">للتسجيل في فعاليات نادي فاب لاب</p>

          {/* Note: audience only */}
          <div className="flex items-start gap-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-4 py-3 mb-6">
            <Info size={15} className="text-brand-blue flex-shrink-0 mt-0.5" />
            <p className="text-brand-blue/80 text-xs leading-relaxed">
              هذا الحساب للجمهور والمتابعين فقط. حسابات الأعضاء تُنشأ من قِبل إدارة النادي.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="الاسم الكامل" name="full_name" type="text" placeholder="محمد عبدالله" required />
            <Input label="البريد الإلكتروني" name="email" type="email"
              placeholder="example@email.com" required className="english-text" />
            <Input label="رقم الجوال" name="phone" type="tel"
              placeholder="05xxxxxxxx" className="english-text" />

            <div className="relative">
              <Input
                label="كلمة المرور"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="8 أحرف على الأقل"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-9 text-white/40 hover:text-white/70 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input label="تأكيد كلمة المرور" name="confirm_password"
              type="password" placeholder="أعد كتابة كلمة المرور" required />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              إنشاء الحساب
            </Button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            لديك حساب؟{' '}
            <Link href="/login" className="text-brand-blue hover:text-blue-400 transition-colors font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
