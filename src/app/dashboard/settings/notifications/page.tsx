'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NotificationSettings {
  whatsapp_phone: string | null
  whatsapp_notifications_enabled: boolean
  email_notifications_enabled: boolean
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/customer/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
      setWhatsappPhone(data.whatsapp_phone || '')
      setWhatsappEnabled(data.whatsapp_notifications_enabled)
      setEmailEnabled(data.email_notifications_enabled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/customer/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_phone: whatsappPhone || null,
          whatsapp_notifications_enabled: whatsappEnabled,
          email_notifications_enabled: emailEnabled,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestWhatsApp = async () => {
    if (!whatsappPhone) {
      setError('Ange ett WhatsApp-nummer först')
      return
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp', phone: whatsappPhone }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send test')
      }

      alert('Testmeddelande skickat!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Notifieringar</h1>
          <p className="text-zinc-400">Konfigurera hur du vill bli notifierad om samtal</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Inställningarna har sparats!
          </p>
        </div>
      )}

      {/* WhatsApp section */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">WhatsApp-notifieringar</h2>
            <p className="text-zinc-500 text-sm">
              Få sammanfattningar av samtal direkt till WhatsApp
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-zinc-300">Aktivera WhatsApp-notifieringar</label>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                whatsappEnabled ? 'bg-green-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  whatsappEnabled ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              WhatsApp-nummer (med landskod)
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="+46701234567"
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleTestWhatsApp}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                Testa
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              T.ex. +46701234567 för svenska nummer
            </p>
          </div>
        </div>
      </section>

      {/* Email section */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">E-postnotifieringar</h2>
            <p className="text-zinc-500 text-sm">
              Få sammanfattningar av samtal till din e-post
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-zinc-300">Aktivera e-postnotifieringar</label>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              emailEnabled ? 'bg-blue-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                emailEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isSaving ? 'Sparar...' : 'Spara inställningar'}
        </button>
      </div>
    </div>
  )
}
