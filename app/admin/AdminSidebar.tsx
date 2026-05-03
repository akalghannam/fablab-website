'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, ClipboardCheck, FlaskConical, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'الإحصائيات', icon: LayoutDashboard, exact: true },
  { href: '/admin/events', label: 'الفعاليات', icon: CalendarDays, exact: false },
  { href: '/admin/members', label: 'الأعضاء', icon: Users, exact: false },
  { href: '/admin/attendance', label: 'سجلات الحضور', icon: ClipboardCheck, exact: false },
  { href: '/admin/lab-status', label: 'تقارير المختبر', icon: FlaskConical, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <div className="glass-card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-brand-orange" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">لوحة الإدارة</p>
          <p className="text-white/40 text-xs">صلاحيات كاملة</p>
        </div>
      </div>

      <nav className="glass-card overflow-hidden">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors',
                isActive
                  ? 'bg-brand-orange/15 text-brand-orange font-medium border-r-2 border-r-brand-orange'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
