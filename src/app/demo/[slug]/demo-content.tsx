'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'
import { useVapi } from '@/hooks/use-vapi'
import { CallButton } from '@/components/demo/call-button'
import { SuggestedQuestions } from '@/components/demo/suggested-questions'
import { CTASection } from '@/components/demo/cta-section'
import type { Industry } from '@/lib/claude/schemas'

interface Business {
  id: string
  name: string
  description: string
  industry: Industry
  vapi_assistant_id: string
}

interface DemoContentProps {
  business: Business
  suggestedQuestions: string[]
}

export function DemoContent({ business, suggestedQuestions }: DemoContentProps) {
  const trackCallStart = useCallback(async () => {
    try {
      await fetch('/api/lead/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          eventType: 'call_started',
        }),
      })
    } catch (error) {
      console.error('Failed to track call start:', error)
    }
  }, [business.id])

  const trackCallEnd = useCallback(async (duration?: number) => {
    try {
      await fetch('/api/lead/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          eventType: 'call_ended',
          metadata: { duration },
        }),
      })
    } catch (error) {
      console.error('Failed to track call end:', error)
    }
  }, [business.id])

  const { status, volumeLevel, transcript, startCall, endCall } = useVapi({
    publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '',
    assistantId: business.vapi_assistant_id,
    onCallStart: trackCallStart,
    onCallEnd: trackCallEnd,
  })

  return (
    <div className="min-h-screen bg-[#F4F3F3] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 px-6 py-4 bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/anythingVoiceLogo.png"
              alt="AnythingVoice"
              width={100}
              height={33}
              priority
            />
          </Link>

          {/* Business info */}
          <div className="text-right">
            <span className="text-xs font-semibold text-[#5A9BC7] uppercase tracking-wider">
              Demo
            </span>
            <h1 className="text-lg font-bold text-slate-900">{business.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-10">
          {/* Intro text */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Lyssna på din AI-receptionist
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              Tryck på knappen och ställ en fråga. Testa hur jag skulle svara som receptionist för {business.name}.
            </p>
          </div>

          {/* Call Interface */}
          <div className="flex flex-col items-center py-6">
            <CallButton
              status={status}
              volumeLevel={volumeLevel}
              onStart={startCall}
              onEnd={endCall}
            />
            <p className="mt-4 text-sm text-slate-500">
              {status === 'idle' && 'Tryck för att starta'}
              {status === 'connecting' && 'Ansluter...'}
              {status === 'connected' && 'Prata nu'}
            </p>
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Transkript
              </h3>
              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {transcript}
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          <div>
            <p className="text-center text-sm text-slate-500 mb-4">
              Testa att fråga:
            </p>
            <div className="flex justify-center">
              <SuggestedQuestions questions={suggestedQuestions} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* CTA Section */}
          <CTASection
            businessId={business.id}
            businessName={business.name}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image
              src="/anythingVoiceLogo.png"
              alt="AnythingVoice"
              width={80}
              height={27}
            />
          </Link>
        </div>
      </footer>
    </div>
  )
}
