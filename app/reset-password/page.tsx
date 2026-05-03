'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { GlowBackground } from '@/components/GlowBackground'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/app/actions/auth'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
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
    const confirm = formData.get('confirm_password') as string

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

    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 3000)
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
                تعيين كلمة مرور جديدة
              </h1>
              <p className="text-white/40 text-sm text-center mb-8">
                أدخل كلمة المرور الجديدة لحسابك
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Input
                    label="كلمة المرور الجديدة"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="8 أحرف على الأقل"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-9 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <Input
                  label="تأكيد كلمة المرور الجديدة"
                  name="confirm_password"
                  type="password"
                  placeholder="أعد كتابة كلمة المرور"
                  required
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  حفظ كلمة المرور الجديدة
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle size={60} className="text-emerald-400 mx-auto mb-5" />
              <h2 className="text-2xl font-bold text-white mb-3">تم التغيير بنجاح!</h2>
              <p className="text-white/50 mb-2 leading-relaxed">
                تم تغيير كلمة المرور. سيتم تحويلك إلى صفحة تسجيل الدخول...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
