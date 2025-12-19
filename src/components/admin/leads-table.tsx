'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import type { Business } from '@/types/database'
import { AddEmailModal } from './add-email-modal'

interface LeadsTableProps {
  leads: Business[]
  onRefresh?: () => void
  onSendEmail?: (businessId: string) => Promise<void>
}

interface ActivateModalState {
  isOpen: boolean
  business: Business | null
  isLoading: boolean
  error: string | null
  success: {
    phoneNumber: string
    phoneDisplay: string
    assistantName?: string
  } | null
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

export function LeadsTable({ leads, onRefresh, onSendEmail }: LeadsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)
  const [modal, setModal] = useState<ActivateModalState>({
    isOpen: false,
    business: null,
    isLoading: false,
    error: null,
    success: null,
  })

  // Form state for activation
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')

  const openActivateModal = (business: Business) => {
    setModal({
      isOpen: true,
      business,
      isLoading: false,
      error: null,
      success: null,
    })
    // Pre-fill with business data if available
    setCustomerEmail(business.email || business.contact_email || '')
    setCustomerName(business.contact_name || '')
    setWhatsappPhone('')
    setTelegramChatId('')
  }

  const closeModal = () => {
    setModal({
      isOpen: false,
      business: null,
      isLoading: false,
      error: null,
      success: null,
    })
    if (modal.success && onRefresh) {
      onRefresh()
    }
  }

  const handleActivate = async () => {
    if (!modal.business || !customerEmail) return

    setModal((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/business/${modal.business.id}/activate-production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail,
          customerName,
          whatsappPhone: whatsappPhone || undefined,
          telegramChatId: telegramChatId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate production')
      }

      setModal((prev) => ({
        ...prev,
        isLoading: false,
        success: {
          phoneNumber: data.phoneNumber.number,
          phoneDisplay: data.phoneNumber.display,
          assistantName: data.assistant?.name,
        },
      }))
    } catch (err) {
      setModal((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Something went wrong',
      }))
    }
  }

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
    <>
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
              const canActivate = lead.vapi_assistant_id && !lead.is_production
              const canSwitch = lead.vapi_assistant_id && lead.is_production
              const canSendEmail = lead.vapi_assistant_id && lead.preview_url && !lead.email_sent_at
              const hasEmail = lead.email || lead.contact_email

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
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{lead.name || 'Unnamed'}</p>
                            {lead.is_production && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 rounded">
                                LIVE
                              </span>
                            )}
                          </div>
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
                        {/* Send Email button */}
                        {canSendEmail && hasEmail && onSendEmail && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              setSendingEmailId(lead.id)
                              try {
                                await onSendEmail(lead.id)
                              } finally {
                                setSendingEmailId(null)
                              }
                            }}
                            disabled={sendingEmailId === lead.id}
                            className="px-2.5 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 text-white rounded transition-colors flex items-center gap-1"
                          >
                            {sendingEmailId === lead.id ? (
                              <>
                                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Skickar...
                              </>
                            ) : (
                              'Skicka demo'
                            )}
                          </button>
                        )}
                        {/* Customer login button */}
                        {lead.is_production && hasEmail && (
                          <Link
                            href={`/login?email=${encodeURIComponent(lead.email || lead.contact_email || '')}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                          >
                            Kundlogin
                          </Link>
                        )}
                        {canActivate && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openActivateModal(lead)
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            Aktivera
                          </button>
                        )}
                        {canSwitch && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openActivateModal(lead)
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Byt till aktiv
                          </button>
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
                          {lead.vapi_assistant_id && (
                            <div>
                              <p className="text-zinc-500">AI Agent ID</p>
                              <p className="text-zinc-300 font-mono text-xs">{lead.vapi_assistant_id.slice(0, 8)}...</p>
                            </div>
                          )}
                          {lead.email_sent_at && (
                            <div>
                              <p className="text-zinc-500">Email skickat</p>
                              <p className="text-zinc-300">{formatDate(lead.email_sent_at)}</p>
                            </div>
                          )}
                          {lead.is_production && (
                            <div className="col-span-full mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                              <p className="text-green-400 font-medium text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Produktionskund - Aktiv AI-assistent
                              </p>
                              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                                <p className="text-zinc-400">
                                  Aktiverad: {formatDate(lead.production_enabled_at)}
                                </p>
                                {(lead as Business & { connected_phone?: { phone_number_display?: string; phone_number?: string } }).connected_phone && (
                                  <p className="text-zinc-400">
                                    Telefon: <span className="text-white font-mono">
                                      {(lead as Business & { connected_phone?: { phone_number_display?: string; phone_number?: string } }).connected_phone?.phone_number_display ||
                                       (lead as Business & { connected_phone?: { phone_number_display?: string; phone_number?: string } }).connected_phone?.phone_number}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
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

      {/* Activation Modal */}
      {modal.isOpen && modal.business && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4 p-6">
            {modal.success ? (
              // Success state
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {modal.business?.is_production ? 'Assistent bytt!' : 'Produktion aktiverad!'}
                </h3>
                <p className="text-zinc-400 mb-4">
                  {modal.success.assistantName || modal.business?.name} svarar nu på samtal till:
                </p>
                <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                  <p className="text-2xl font-mono text-white">{modal.success.phoneDisplay}</p>
                  {modal.success.assistantName && (
                    <p className="text-sm text-zinc-400 mt-2">AI: {modal.success.assistantName}</p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Stäng
                </button>
              </div>
            ) : (
              // Form state
              <>
                <h3 className="text-xl font-bold text-white mb-2">
                  {modal.business.is_production ? 'Byt aktiv assistent' : 'Aktivera produktion'}
                </h3>
                <p className="text-zinc-400 text-sm mb-6">
                  {modal.business.is_production
                    ? `Byt till ${modal.business.name} som aktiv AI-assistent på telefonnumret.`
                    : `Aktivera ${modal.business.name} som produktionskund med ett svenskt telefonnummer.`
                  }
                </p>

                {modal.error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{modal.error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Kund-email *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="kund@företag.se"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Kontaktnamn
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Anna Andersson"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      WhatsApp-nummer (valfritt)
                    </label>
                    <input
                      type="tel"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="+46701234567"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">
                      Telegram Chat ID (valfritt)
                    </label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="123456789"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Starta en chatt med din bot och kör /start för att få ditt Chat ID
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    disabled={modal.isLoading}
                    className="flex-1 py-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={handleActivate}
                    disabled={modal.isLoading || !customerEmail}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {modal.isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {modal.business?.is_production ? 'Byter...' : 'Aktiverar...'}
                      </>
                    ) : (
                      modal.business?.is_production ? 'Byt assistent' : 'Aktivera produktion'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
