import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import type { TranscriptMessage } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

const SENTIMENT_STYLES = {
  positive: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Positiv' },
  neutral: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Neutral' },
  negative: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Negativ' },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins} min ${secs} sek`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CallDetailPage({ params }: PageProps) {
  const { id } = await params
  const customer = await getCurrentCustomer()
  const supabase = await createSupabaseServerClient()

  if (!customer) {
    return null
  }

  // Get call details
  const { data: call, error } = await supabase
    .from('customer_calls')
    .select('*')
    .eq('id', id)
    .eq('customer_id', customer.id)
    .single()

  if (error || !call) {
    notFound()
  }

  const sentiment = SENTIMENT_STYLES[call.sentiment] || SENTIMENT_STYLES.neutral
  const transcript = (call.transcript || []) as TranscriptMessage[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/calls"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Samtal med {call.caller_name || call.caller_phone || 'Okänd'}
          </h1>
          <p className="text-zinc-400">{formatDate(call.created_at)}</p>
        </div>
      </div>

      {/* Call info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Uppringare</p>
          <p className="text-white font-medium">{call.caller_name || 'Okänd'}</p>
          {call.caller_phone && (
            <p className="text-zinc-500 text-sm">{call.caller_phone}</p>
          )}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Samtalslängd</p>
          <p className="text-white font-medium">{formatDuration(call.duration_seconds)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Sentiment</p>
          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${sentiment.bg} ${sentiment.text}`}>
            {sentiment.label}
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Uppföljning krävs</p>
          <p className={`font-medium ${call.follow_up_required ? 'text-yellow-400' : 'text-zinc-400'}`}>
            {call.follow_up_required ? 'Ja' : 'Nej'}
          </p>
        </div>
      </div>

      {/* Summary and Topic */}
      {(call.summary || call.topic) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          {call.topic && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Ämne</h3>
              <p className="text-white">{call.topic}</p>
            </div>
          )}
          {call.summary && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Sammanfattning</h3>
              <p className="text-zinc-300 leading-relaxed">{call.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Action items */}
      {call.action_items && call.action_items.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Åtgärdspunkter</h3>
          <ul className="space-y-3">
            {call.action_items.map((item: { description: string; priority?: string }, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-zinc-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-300">{item.description}</p>
                  {item.priority && (
                    <span className={`text-xs ${
                      item.priority === 'high' ? 'text-red-400' :
                      item.priority === 'medium' ? 'text-yellow-400' :
                      'text-zinc-500'
                    }`}>
                      {item.priority === 'high' ? 'Hög prioritet' :
                       item.priority === 'medium' ? 'Medium prioritet' :
                       'Låg prioritet'}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcript */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Transkription</h3>
        {transcript.length > 0 ? (
          <div className="space-y-4">
            {transcript.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'assistant' ? '' : 'flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' ? 'bg-blue-600' : 'bg-zinc-700'
                }`}>
                  {message.role === 'assistant' ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className={`flex-1 max-w-[80%] ${message.role === 'assistant' ? '' : 'text-right'}`}>
                  <p className="text-xs text-zinc-500 mb-1">
                    {message.role === 'assistant' ? 'AI-receptionist' : 'Uppringare'}
                  </p>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'assistant' ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-600/20 text-blue-100'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-8">
            Ingen transkription tillgänglig för detta samtal
          </p>
        )}
      </div>

      {/* Notification status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notifieringar</h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            {call.whatsapp_notified_at ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">WhatsApp skickad</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-zinc-500">WhatsApp ej skickad</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {call.email_notified_at ? (
              <>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">E-post skickad</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-zinc-500">E-post ej skickad</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
