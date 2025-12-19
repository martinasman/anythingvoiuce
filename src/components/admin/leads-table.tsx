'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Fragment, useState } from 'react'
import type { Business } from '@/types/database'
import { AddEmailModal } from './add-email-modal'

interface LeadsTableProps {
  leads: Business[]
  onSendEmail?: (businessId: string) => Promise<void>
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-600' },
  scraped: { bg: 'bg-amber-100', text: 'text-amber-700' },
  agent_created: { bg: 'bg-[#E1EFF9]', text: 'text-[#275379]' },
  email_sent: { bg: 'bg-violet-100', text: 'text-violet-700' },
  interested: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  contacted: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  customer: { bg: 'bg-green-100', text: 'text-green-700' },
  declined: { bg: 'bg-rose-100', text: 'text-rose-700' },
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  scraped: 'Scraped',
  agent_created: 'Agent Created',
  email_sent: 'Email Sent',
  interested: 'Interested',
  contacted: 'Contacted',
  customer: 'Customer',
  declined: 'Declined',
}

const INDUSTRY_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  salon: 'Salon',
  clinic: 'Clinic',
  contractor: 'Contractor',
  auto: 'Auto Shop',
  realestate: 'Real Estate',
  other: 'Other',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LeadsTable({ leads, onSendEmail }: LeadsTableProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [addEmailBusinessId, setAddEmailBusinessId] = useState<string | null>(null)
  const [addEmailBusinessName, setAddEmailBusinessName] = useState<string>('')

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-slate-200 p-12 text-center">
        <p className="text-slate-500">No leads yet</p>
        <p className="text-slate-400 text-sm mt-1">
          Run the pipeline to create leads
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Business
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Industry
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              City
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {leads.map((lead) => {
            const isExpanded = expandedId === lead.id
            const statusStyle = STATUS_STYLES[lead.status] || STATUS_STYLES.pending

            return (
              <Fragment key={lead.id}>
                <tr
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#5A9BC7] flex items-center justify-center text-white text-sm font-medium">
                        {(lead.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-900 font-medium">{lead.name || 'Unnamed'}</p>
                        {lead.phone && (
                          <p className="text-slate-400 text-sm">{lead.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">
                      {INDUSTRY_LABELS[lead.industry] || lead.industry}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{lead.city || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-sm ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {STATUS_LABELS[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {lead.email_sent_at ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 text-xs">Sent</span>
                        {lead.email_opened_at && (
                          <span className="text-[#5A9BC7] text-xs" title="Opened">
                            👁
                          </span>
                        )}
                      </div>
                    ) : !lead.contact_email && !lead.email ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setAddEmailBusinessId(lead.id)
                          setAddEmailBusinessName(lead.name || 'Unknown')
                        }}
                        className="text-xs px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-sm transition-colors flex items-center gap-1"
                      >
                        ⚠️ Add
                      </button>
                    ) : lead.status === 'agent_created' && onSendEmail ? (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          setSendingEmail(lead.id)
                          try {
                            await onSendEmail(lead.id)
                          } finally {
                            setSendingEmail(null)
                          }
                        }}
                        disabled={sendingEmail === lead.id}
                        className="text-xs px-2 py-1 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 disabled:cursor-not-allowed text-white rounded-sm transition-colors"
                      >
                        {sendingEmail === lead.id ? 'Sending...' : 'Send'}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.preview_url && (
                        <Link
                          href={lead.preview_url}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#5A9BC7] hover:text-[#4683AE] text-sm font-medium"
                        >
                          Demo
                        </Link>
                      )}
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
                    <td colSpan={7} className="px-6 py-4 bg-slate-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Email</p>
                          <p className="text-slate-700">{lead.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Phone</p>
                          <p className="text-slate-700">{lead.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Call Duration</p>
                          <p className="text-slate-700">
                            {lead.preview_call_duration_seconds
                              ? `${Math.floor(lead.preview_call_duration_seconds / 60)}m ${lead.preview_call_duration_seconds % 60}s`
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">CTA Clicked</p>
                          <p className="text-slate-700">{formatDate(lead.cta_clicked_at)}</p>
                        </div>
                        {lead.description && (
                          <div className="col-span-full">
                            <p className="text-slate-400">Description</p>
                            <p className="text-slate-700">{lead.description}</p>
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
      {addEmailBusinessId && (
        <AddEmailModal
          businessId={addEmailBusinessId}
          businessName={addEmailBusinessName}
          onClose={() => setAddEmailBusinessId(null)}
          onSuccess={() => {
            router.refresh()
            setAddEmailBusinessId(null)
          }}
        />
      )}
    </div>
  )
}
