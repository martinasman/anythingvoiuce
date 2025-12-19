import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import type { CustomerCall } from '@/types/database'

export const dynamic = 'force-dynamic'

const SENTIMENT_STYLES = {
  positive: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Positiv' },
  neutral: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Neutral' },
  negative: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Negativ' },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CallsPage() {
  const customer = await getCurrentCustomer()
  const supabase = await createSupabaseServerClient()

  if (!customer) {
    return null
  }

  // Get all calls for this customer
  const { data: calls, error } = await supabase
    .from('customer_calls')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching calls:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Samtal</h1>
        <p className="text-zinc-400 mt-1">
          Översikt över alla inkommande samtal
        </p>
      </div>

      {calls && calls.length > 0 ? (
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
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                  Längd
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">
                  Tid
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {calls.map((call: CustomerCall) => {
                const sentiment = SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.neutral

                return (
                  <tr key={call.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {call.caller_name || 'Okänd'}
                        </p>
                        <p className="text-zinc-500 text-sm">
                          {call.caller_phone || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-300 max-w-xs truncate">
                        {call.topic || call.summary?.substring(0, 50) || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${sentiment.bg} ${sentiment.text}`}>
                        {sentiment.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {formatDate(call.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/calls/${call.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Visa detaljer
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 text-zinc-600 mx-auto mb-4"
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
          <h2 className="text-xl font-semibold text-white mb-2">Inga samtal ännu</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            När din AI-receptionist tar emot samtal kommer de att visas här med fullständig transkription och analys.
          </p>
        </div>
      )}
    </div>
  )
}
