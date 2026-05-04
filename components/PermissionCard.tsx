import Link from 'next/link'
import { Users, CircleDot, CalendarDays, UsersRound } from 'lucide-react'
import type { Permission } from '@/types'

const PERMISSION_CONFIG: Record<Permission, {
  label: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}> = {
  CREATE_MEMBERS: {
    label: 'إدارة الأعضاء',
    description: 'إنشاء وتعديل وحذف حسابات الأعضاء وتحديد صلاحياتهم',
    href: '/dashboard/manage-members',
    icon: <Users size={28} />,
    color: 'text-brand-orange bg-brand-orange/15 border-brand-orange/30',
  },
  CHANGE_LAB_STATUS: {
    label: 'حالة المقر',
    description: 'تغيير حالة المقر (مغلق / يوجد اجتماع / مفتوح)',
    href: '/dashboard/lab-status-control',
    icon: <CircleDot size={28} />,
    color: 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30',
  },
  MANAGE_EVENTS: {
    label: 'إدارة الفعاليات',
    description: 'إضافة وتعديل وحذف الفعاليات ورفع الصور',
    href: '/dashboard/manage-events',
    icon: <CalendarDays size={28} />,
    color: 'text-brand-blue bg-brand-blue/15 border-brand-blue/30',
  },
  VIEW_AUDIENCE: {
    label: 'بيانات الجماهير',
    description: 'عرض بيانات المسجلين في الفعاليات من الجمهور',
    href: '/dashboard/audience',
    icon: <UsersRound size={28} />,
    color: 'text-purple-400 bg-purple-400/15 border-purple-400/30',
  },
}

interface Props {
  permission: Permission
}

export function PermissionCard({ permission }: Props) {
  const config = PERMISSION_CONFIG[permission]

  return (
    <Link href={config.href}
      className="glass-card p-6 flex items-start gap-4 hover:bg-white/[0.08] transition-all duration-300 group border border-white/10 hover:border-white/20">
      <div className={`p-3 rounded-xl border flex-shrink-0 ${config.color} group-hover:scale-110 transition-transform`}>
        {config.icon}
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-1">{config.label}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{config.description}</p>
      </div>
    </Link>
  )
}
