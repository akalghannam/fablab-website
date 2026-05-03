'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardCheck, FlaskConical, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

interface Props {
  user: User
}

const links = [
  { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/attendance', label: 'تسجيل الحضور', icon: ClipboardCheck, exact: false },
  { href: '/dashboard/lab-status', label: 'حالة المختبر', icon: FlaskConical, exact: false },
]

export function DashboardSidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      {/* User info */}
      <div className="glass-card p-5 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center flex-shrink-0">
          <UserIcon size={18} className="text-brand-blue" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium text-sm truncate">{user.full_name ?? 'عضو'}</p>
          <p className="text-white/40 text-xs truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav links */}
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
                  ? 'bg-brand-blue/15 text-brand-blue font-medium border-r-2 border-r-brand-blue'
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
