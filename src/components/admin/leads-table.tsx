'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import type { Business } from '@/types/database'

interface LeadsTableProps {
  leads: Business[]
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-zinc-700', text: 'text-zinc-300' },
  scraped: { bg: 'bg-yellow-900/50', text: 'text-yellow-300' },
  agent_created: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
  email_sent: { bg: 'bg-purple-900/50', text: 'text-purple-300' },
  interested: { bg: 'bg-green-900/50', text: 'text-green-300' },
  contacted: { bg: 'bg-cyan-900/50', text: 'text-cyan-300' },
  customer: { bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
  declined: { bg: 'bg-red-900/50', text: 'text-red-300' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Väntar',
  scraped: 'Scrapat',
  agent_created: 'Agent skapad',
  email_sent: 'Email skickat',
  interested: 'Intresserad',
  contacted: 'Kontaktad',
  customer: 'Kund',
  declined: 'Avböjt',
}

const INDUSTRY_LABELS: Record<string, string> = {
  restaurant: 'Restaurang',
  salon: 'Salong',
  clinic: 'Klinik',
  contractor: 'Hantverkare',
  auto: 'Verkstad',
  realestate: 'Mäklare',
  other: 'Annat',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (leads.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
        <p className="text-zinc-400">Inga leads ännu</p>
        <p className="text-zinc-500 text-sm mt-1">
          Kör pipeline för att skapa leads
        </p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Företag
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Bransch
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Stad
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Skapad
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Åtgärder
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {leads.map((lead) => {
            const isExpanded = expandedId === lead.id
            const statusStyle = STATUS_STYLES[lead.status] || STATUS_STYLES.pending

            return (
              <Fragment key={lead.id}>
                <tr
                  className="hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {(lead.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{lead.name || 'Unnamed'}</p>
                        {lead.phone && (
                          <p className="text-zinc-500 text-sm">{lead.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">
                      {INDUSTRY_LABELS[lead.industry] || lead.industry}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-300">{lead.city || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.preview_url && (
                        <Link
                          href={lead.preview_url}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          Demo
                        </Link>
                      )}
                      <svg
                        className={`w-5 h-5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-zinc-800/20">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-zinc-500">Email</p>
                          <p className="text-zinc-300">{lead.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Telefon</p>
                          <p className="text-zinc-300">{lead.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Samtalstid</p>
                          <p className="text-zinc-300">
                            {lead.preview_call_duration_seconds
                              ? `${Math.floor(lead.preview_call_duration_seconds / 60)}m ${lead.preview_call_duration_seconds % 60}s`
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500">CTA klickad</p>
                          <p className="text-zinc-300">{formatDate(lead.cta_clicked_at)}</p>
                        </div>
                        {lead.description && (
                          <div className="col-span-full">
                            <p className="text-zinc-500">Beskrivning</p>
                            <p className="text-zinc-300">{lead.description}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
