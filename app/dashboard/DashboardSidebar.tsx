'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ClipboardCheck, FlaskConical,
  Users, CircleDot, CalendarDays, UsersRound, User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User, Permission } from '@/types'

interface Props {
  user: User
  permissions: Permission[]
}

const PERMISSION_LINKS: Record<Permission, { href: string; label: string; icon: React.ReactNode }> = {
  CREATE_MEMBERS:    { href: '/dashboard/manage-members',    label: 'إدارة الأعضاء',    icon: <Users size={17} /> },
  CHANGE_LAB_STATUS: { href: '/dashboard/lab-status-control', label: 'حالة المقر',       icon: <CircleDot size={17} /> },
  MANAGE_EVENTS:     { href: '/dashboard/manage-events',     label: 'إدارة الفعاليات',  icon: <CalendarDays size={17} /> },
  VIEW_AUDIENCE:     { href: '/dashboard/audience',          label: 'بيانات الجماهير',  icon: <UsersRound size={17} /> },
}

const BASE_LINKS = [
  { href: '/dashboard',           label: 'نظرة عامة',       icon: <LayoutDashboard size={17} />, exact: true },
  { href: '/dashboard/attendance', label: 'تسجيل الحضور',   icon: <ClipboardCheck size={17} />,  exact: false },
  { href: '/dashboard/lab-status', label: 'تقارير المختبر', icon: <FlaskConical size={17} />,    exact: false },
]

export function DashboardSidebar({ user, permissions }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      {/* User info */}
      <div className="glass-card p-5 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center flex-shrink-0">
          <UserIcon size={18} className="text-brand-blue" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium text-sm truncate">{user.full_name ?? 'عضو'}</p>
          <p className="text-white/40 text-xs truncate">{user.username ?? user.email}</p>
        </div>
      </div>

      {/* Base navigation */}
      <nav className="glass-card overflow-hidden mb-4">
        {BASE_LINKS.map(({ href, label, icon, exact }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors',
              isActive(href, exact)
                ? 'bg-brand-blue/15 text-brand-blue font-medium border-r-2 border-r-brand-blue'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}>
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Permission-based links */}
      {permissions.length > 0 && (
        <nav className="glass-card overflow-hidden">
          <p className="px-4 py-2 text-xs text-white/30 border-b border-white/5 font-medium">صلاحياتي</p>
          {permissions.map(perm => {
            const link = PERMISSION_LINKS[perm]
            return (
              <Link key={perm} href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm border-b border-white/5 last:border-0 transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-brand-orange/15 text-brand-orange font-medium border-r-2 border-r-brand-orange'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}>
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </aside>
  )
}
