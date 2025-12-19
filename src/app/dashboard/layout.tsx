import { redirect } from 'next/navigation'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await getCurrentCustomer()

  // Redirect to login if not authenticated
  if (!customer) {
    redirect('/login?redirectTo=/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader customer={customer} />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
