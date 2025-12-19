'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { VoiceOption, Business } from '@/types/database'

type Step = 'select' | 'voice' | 'whatsapp' | 'processing' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [voices, setVoices] = useState<VoiceOption[]>([])

  // Selections
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [newBusinessName, setNewBusinessName] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  const [whatsappPhone, setWhatsappPhone] = useState('')

  // Result
  const [result, setResult] = useState<{
    phoneNumber: string
    phoneDisplay: string
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load existing businesses (demos that can be converted)
      const bizResponse = await fetch('/api/customer/businesses')
      if (bizResponse.ok) {
        const bizData = await bizResponse.json()
        setBusinesses(bizData.businesses || [])
      }

      // Load voices
      const voiceResponse = await fetch('/api/voices')
      if (voiceResponse.ok) {
        const voiceData = await voiceResponse.json()
        setVoices(voiceData.voices || [])
        if (voiceData.voices?.length > 0) {
          setSelectedVoice(voiceData.voices[0].voice_id)
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    setStep('processing')
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness || undefined,
          businessName: selectedBusiness ? undefined : (newBusinessName || 'Mitt företag'),
          voiceId: selectedVoice,
          whatsappPhone: whatsappPhone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Onboarding failed')
      }

      setResult({
        phoneNumber: data.phoneNumber.number,
        phoneDisplay: data.phoneNumber.display,
      })
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('whatsapp') // Go back to previous step
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-zinc-400">Laddar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-block mb-4">
            <span className="text-2xl font-bold text-white">
              Anything<span className="text-blue-500">Voice</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Konfigurera din AI-receptionist
          </h1>
          <p className="text-zinc-400">
            Några enkla steg för att komma igång
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['select', 'voice', 'whatsapp', 'complete'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                step === s || ['select', 'voice', 'whatsapp', 'complete'].indexOf(step) > i
                  ? 'bg-blue-500'
                  : 'bg-zinc-700'
              )}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Step content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Välj eller skapa företag
                </h2>
                <p className="text-zinc-400 text-sm">
                  Välj ett befintligt företag från dina demos eller skapa ett nytt.
                </p>
              </div>

              {businesses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-500">Befintliga demos:</p>
                  {businesses.map((biz) => (
                    <button
                      key={biz.id}
                      onClick={() => {
                        setSelectedBusiness(biz.id)
                        setNewBusinessName('')
                      }}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        selectedBusiness === biz.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-800 hover:border-zinc-700'
                      )}
                    >
                      <p className="text-white font-medium">{biz.name}</p>
                      <p className="text-zinc-500 text-sm">{biz.source_url}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-zinc-500">Eller skapa nytt:</p>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => {
                    setNewBusinessName(e.target.value)
                    setSelectedBusiness(null)
                  }}
                  placeholder="Företagsnamn"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => setStep('voice')}
                disabled={!selectedBusiness && !newBusinessName}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Fortsätt
              </button>
            </div>
          )}

          {step === 'voice' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Välj röst
                </h2>
                <p className="text-zinc-400 text-sm">
                  Välj vilken röst din AI-receptionist ska använda.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.voice_id)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all flex items-center gap-4',
                      selectedVoice === voice.voice_id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-800 hover:border-zinc-700'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                      voice.gender === 'male' ? 'bg-blue-500/20' : 'bg-pink-500/20'
                    )}>
                      {voice.gender === 'male' ? '👨' : '👩'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{voice.display_name}</p>
                      <p className="text-zinc-500 text-sm">{voice.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
                >
                  Tillbaka
                </button>
                <button
                  onClick={() => setStep('whatsapp')}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Fortsätt
                </button>
              </div>
            </div>
          )}

          {step === 'whatsapp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  WhatsApp-notifieringar
                </h2>
                <p className="text-zinc-400 text-sm">
                  Få sammanfattningar av samtal direkt till WhatsApp. (Valfritt)
                </p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  WhatsApp-nummer (med landskod)
                </label>
                <input
                  type="tel"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="+46701234567"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Lämna tomt för att hoppa över detta steg
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('voice')}
                  className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
                >
                  Tillbaka
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Slutför konfiguration
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <svg className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-2">
                Konfigurerar din AI-receptionist...
              </h2>
              <p className="text-zinc-400">
                Vi skapar ditt telefonnummer och konfigurerar allt åt dig.
              </p>
            </div>
          )}

          {step === 'complete' && result && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Klart!
              </h2>
              <p className="text-zinc-400 mb-8">
                Din AI-receptionist är nu redo att ta emot samtal.
              </p>

              <div className="bg-zinc-800 rounded-xl p-6 mb-8">
                <p className="text-sm text-zinc-400 mb-2">Ditt telefonnummer</p>
                <p className="text-3xl font-bold text-white font-mono">
                  {result.phoneDisplay}
                </p>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Gå till dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
