import Link from 'next/link'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-brand-darker border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Logo width={120} height={42} />
            <p className="text-white/50 text-sm leading-relaxed">
              نادي فاب لاب — مساحة للإبداع والتصنيع الرقمي والابتكار
            </p>
            <span className="english-text text-brand-orange text-xs tracking-widest font-sansation">
              WE PLAN. WE CREATE
            </span>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/events" className="hover:text-brand-blue transition-colors">
                  الفعاليات
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-blue transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-brand-blue transition-colors">
                  إنشاء حساب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a href="mailto:info@fablab.club" className="hover:text-brand-orange transition-colors english-text">
                  info@fablab.club
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} FabLab Club. جميع الحقوق محفوظة.</p>
          <p className="english-text">Powered by Next.js & Supabase</p>
        </div>
      </div>
    </footer>
  )
}
