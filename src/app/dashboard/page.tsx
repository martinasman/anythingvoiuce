import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import { StatsCard } from '@/components/dashboard/stats-card'
import { formatPhoneDisplay } from '@/lib/46elks/client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const customer = await getCurrentCustomer()
  const supabase = await createSupabaseServerClient()

  if (!customer) {
    return null
  }

  // Get customer's business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('customer_id', customer.id)
    .single()

  // Get phone number
  const { data: phoneNumber } = await supabase
    .from('phone_numbers')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()

  // Get call stats
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { count: totalCalls } = await supabase
    .from('customer_calls')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)

  const { count: todayCalls } = await supabase
    .from('customer_calls')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .gte('created_at', startOfToday.toISOString())

  const { count: weekCalls } = await supabase
    .from('customer_calls')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .gte('created_at', startOfWeek.toISOString())

  const { data: totalMinutesData } = await supabase
    .from('customer_calls')
    .select('duration_seconds')
    .eq('customer_id', customer.id)

  const totalMinutes = Math.round(
    (totalMinutesData?.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) || 0) / 60
  )

  // Get recent calls
  const { data: recentCalls } = await supabase
    .from('customer_calls')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const hasSetup = !!business && !!phoneNumber

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Välkommen, {customer.name || customer.company_name || 'där'}!
        </h1>
        <p className="text-zinc-400 mt-1">
          Här är en översikt av din AI-receptionist
        </p>
      </div>

      {/* Setup prompt if not configured */}
      {!hasSetup && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                Kom igång med din AI-receptionist
              </h2>
              <p className="text-zinc-400 mb-4">
                Konfigurera din AI-receptionist för att börja ta emot samtal. Vi hjälper dig att:
              </p>
              <ul className="text-zinc-400 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Skaffa ett svenskt telefonnummer
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Anpassa din AI-receptionist
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Aktivera WhatsApp-notiser
                </li>
              </ul>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Starta konfiguration
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Phone number display */}
      {phoneNumber && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Ditt telefonnummer</p>
              <p className="text-2xl font-bold text-white font-mono">
                {phoneNumber.phone_number_display || formatPhoneDisplay(phoneNumber.phone_number)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">Aktiv</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Totalt antal samtal"
          value={totalCalls || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
          variant="blue"
        />
        <StatsCard
          title="Samtal idag"
          value={todayCalls || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          variant="green"
        />
        <StatsCard
          title="Denna vecka"
          value={weekCalls || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          variant="yellow"
        />
        <StatsCard
          title="Total samtalstid"
          value={`${totalMinutes} min`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="default"
        />
      </div>

      {/* Recent calls */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Senaste samtalen</h2>
          <Link
            href="/dashboard/calls"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Visa alla
          </Link>
        </div>

        {recentCalls && recentCalls.length > 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                    Uppringare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                    Ämne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                    Längd
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                    Tid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-zinc-800/30">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">
                        {call.caller_name || call.caller_phone || 'Okänd'}
                      </p>
                      {call.caller_name && call.caller_phone && (
                        <p className="text-zinc-500 text-sm">{call.caller_phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {call.topic || call.summary?.substring(0, 50) || '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {call.duration_seconds
                        ? `${Math.floor(call.duration_seconds / 60)}:${String(call.duration_seconds % 60).padStart(2, '0')}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {new Date(call.created_at).toLocaleString('sv-SE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <svg
              className="w-12 h-12 text-zinc-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <p className="text-zinc-400">Inga samtal ännu</p>
            <p className="text-zinc-500 text-sm mt-1">
              {hasSetup
                ? 'Samtal kommer att visas här när de kommer in'
                : 'Konfigurera din AI-receptionist för att börja ta emot samtal'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
