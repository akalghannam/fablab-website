'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Logo } from './Logo'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import type { User } from '@/types'

interface NavbarProps {
  user?: User | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-brand-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Tagline */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Logo width={120} height={42} />
            <span className="hidden sm:block text-[10px] font-sansation text-brand-orange tracking-[0.2em] uppercase english-text">
              WE PLAN. WE FABRICATE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/events"
              className="text-white/80 hover:text-brand-blue transition-colors">
              الفعاليات
            </Link>
            {!user && (
              <>
                <Link href="/login"
                  className="text-white/80 hover:text-white transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/signup"
                  className="btn-primary text-sm py-2 px-5">
                  إنشاء حساب
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Link href="/admin"
                className="flex items-center gap-1.5 text-brand-orange hover:text-orange-400 transition-colors">
                <Shield size={15} />
                لوحة الإدارة
              </Link>
            )}
            {user && (
              <>
                <Link href="/dashboard"
                  className="flex items-center gap-1.5 text-white/80 hover:text-brand-blue transition-colors">
                  <LayoutDashboard size={15} />
                  حسابي
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-white/60 hover:text-red-400 transition-colors">
                  <LogOut size={15} />
                  خروج
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/80 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-dark border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4 text-sm font-medium">
            <Link href="/events" onClick={() => setMobileOpen(false)}
              className="text-white/80 hover:text-brand-blue transition-colors py-2 border-b border-white/5">
              الفعاليات
            </Link>
            {!user && (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="text-white/80 hover:text-white transition-colors py-2 border-b border-white/5">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}
                  className="btn-primary text-center text-sm">
                  إنشاء حساب
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Link href="/admin" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-brand-orange py-2 border-b border-white/5">
                <Shield size={15} />
                لوحة الإدارة
              </Link>
            )}
            {user && (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-white/80 py-2 border-b border-white/5">
                  <LayoutDashboard size={15} />
                  حسابي
                </Link>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-400 py-2 text-right">
                  <LogOut size={15} />
                  تسجيل الخروج
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
