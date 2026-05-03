import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { GlowBackground } from '@/components/GlowBackground'
import { DashboardSidebar } from './DashboardSidebar'
import type { User } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!currentUser) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={currentUser as User} />
      <GlowBackground />

      <div className="flex-1 relative z-10">
        <div className="page-container py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <DashboardSidebar user={currentUser as User} />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
