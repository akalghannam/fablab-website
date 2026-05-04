import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { GlowBackground } from '@/components/GlowBackground'
import { LabStatusDot } from '@/components/LabStatusDot'
import { SuperAdminSidebar } from './SuperAdminSidebar'
import { getCurrentLabStatus } from '@/app/actions/current-lab-status'
import type { User } from '@/types'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!currentUser?.is_super_admin) redirect('/dashboard')

  const labStatus = await getCurrentLabStatus()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser as User} />
      <GlowBackground />

      {/* Lab status + super admin indicator */}
      <div className="relative z-10 border-b border-white/10 bg-brand-darker/60 backdrop-blur-sm">
        <div className="page-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-brand-orange/20 text-brand-orange border border-brand-orange/30 rounded-full px-3 py-0.5 font-medium">
              {currentUser.full_name ?? 'مشرف'}
            </span>
          </div>
          <LabStatusDot status={labStatus?.status ?? 'red'} notes={labStatus?.notes ?? undefined} size="lg" />
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <SuperAdminSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
