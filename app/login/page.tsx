'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { GlowBackground } from '@/components/GlowBackground'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signIn } from '@/app/actions/auth'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-brand-dark">
      <GlowBackground variant="auth" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Card */}
        <div className="glass-card p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Logo width={150} height={52} />
            <span className="english-text text-brand-orange text-xs tracking-[0.25em] font-sansation">
              WE PLAN. WE FABRICATE
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            أدخل بياناتك للوصول إلى حسابك
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
              autoComplete="email"
              className="english-text"
            />

            <div className="relative">
              <Input
                label="كلمة المرور"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-9 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="text-left">
              <Link href="/forgot-password"
                className="text-sm text-brand-blue hover:text-blue-400 transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              دخول
            </Button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="text-brand-blue hover:text-blue-400 transition-colors font-medium">
              إنشاء حساب
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          FabLab Club © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
