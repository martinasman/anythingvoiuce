import { createSupabaseServerClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/admin/leads-table'
import { StatsCards } from '@/components/admin/stats-cards'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const supabase = await createSupabaseServerClient()

  // Fetch leads - interested first, then by created date
  const { data: leads } = await supabase
    .from('businesses')
    .select('*')
    .order('cta_clicked_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch stats
  const { count: totalCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  const { count: interestedCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'interested')

  const { count: agentCreatedCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'agent_created')

  const { count: contactedCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'contacted')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <p className="text-zinc-400 mt-1">
          Hantera och följ upp potentiella kunder
        </p>
      </div>

      <StatsCards
        total={totalCount || 0}
        interested={interestedCount || 0}
        agentCreated={agentCreatedCount || 0}
        contacted={contactedCount || 0}
      />

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Alla leads</h2>
        <LeadsTable leads={leads || []} />
      </div>
    </div>
  )
}
