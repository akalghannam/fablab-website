'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CircleDot, CalendarDays, ClipboardCheck, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/super-admin',         label: 'الإحصائيات',      icon: <LayoutDashboard size={17} />, exact: true },
  { href: '/super-admin/members', label: 'الأعضاء',         icon: <Users size={17} />,           exact: false },
  { href: '/super-admin/lab-status', label: 'حالة المقر',   icon: <CircleDot size={17} />,       exact: false },
  { href: '/admin/events',        label: 'الفعاليات',       icon: <CalendarDays size={17} />,    exact: false },
  { href: '/admin/attendance',    label: 'سجلات الحضور',    icon: <ClipboardCheck size={17} />,  exact: false },
  { href: '/admin/lab-status',    label: 'تقارير المختبر',  icon: <FlaskConical size={17} />,    exact: false },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <div className="glass-card p-4 mb-4 border-glow-orange">
        <p className="text-brand-orange font-bold text-sm">لوحة المشرف العام</p>
        <p className="text-white/40 text-xs mt-0.5">صلاحيات كاملة</p>
      </div>

      <nav className="glass-card overflow-hidden">
        {links.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors',
                isActive
                  ? 'bg-brand-orange/15 text-brand-orange font-medium border-r-2 border-r-brand-orange'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}>
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
