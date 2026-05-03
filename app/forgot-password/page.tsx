'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { GlowBackground } from '@/components/GlowBackground'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { forgotPassword } from '@/app/actions/auth'
import { MailCheck, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await forgotPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-brand-dark">
      <GlowBackground variant="auth" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8 md:p-10">
          <div className="flex flex-col items-center gap-3 mb-8">
            <Logo width={140} height={48} />
          </div>

          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                نسيت كلمة المرور؟
              </h1>
              <p className="text-white/40 text-sm text-center mb-8 leading-relaxed">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  required
                  className="english-text"
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  إرسال رابط إعادة التعيين
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <MailCheck size={60} className="text-brand-blue mx-auto mb-5" />
              <h2 className="text-2xl font-bold text-white mb-3">تم الإرسال!</h2>
              <p className="text-white/50 mb-2 leading-relaxed">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
              </p>
              <p className="text-white/30 text-sm mb-8">
                الرابط صالح لمدة ساعة واحدة. تحقق من مجلد الرسائل غير المرغوب فيها إذا لم تجده.
              </p>
            </div>
          )}

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-brand-blue transition-colors">
              <ArrowRight size={15} />
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
