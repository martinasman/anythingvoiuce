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
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section - Dark with gradient */}
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-violet-500/10 via-transparent to-transparent blur-3xl" />

        {/* Header */}
        <header className="relative z-10 px-6 py-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/anythingVoiceLogo.png"
                alt="AnythingVoice"
                width={120}
                height={40}
                priority
                className="brightness-0 invert"
              />
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20">
                Demo
              </span>
            </div>
          </div>
        </header>

        {/* Main Hero Content */}
        <main className="relative z-10 px-6 pt-8 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Business Name Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/80 font-medium">{business.name}</span>
              </div>
            </div>

            {/* Hero Text */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Lyssna på din
                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  AI-receptionist
                </span>
              </h1>
              <p className="text-lg text-white/50 max-w-md mx-auto">
                Tryck på knappen och ställ en fråga
              </p>
            </div>

            {/* Call Interface - Centered with glow */}
            <div className="flex flex-col items-center">
              {/* Glow behind button */}
              <div className="relative">
                <div className="absolute inset-0 scale-150 bg-gradient-radial from-violet-500/20 via-transparent to-transparent blur-2xl" />
                <CallButton
                  status={status}
                  volumeLevel={volumeLevel}
                  onStart={startCall}
                  onEnd={endCall}
                />
              </div>
              <p className="mt-6 text-sm font-medium text-white/40">
                {status === 'idle' && 'Tryck för att starta'}
                {status === 'connecting' && 'Ansluter...'}
                {status === 'active' && 'Prata nu'}
              </p>
            </div>

            {/* Live Transcript */}
            {transcript && (
              <div className="mt-12 max-w-2xl mx-auto">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Live transkript
                    </span>
                  </div>
                  <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                    {transcript}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            <div className="mt-16">
              <SuggestedQuestions questions={suggestedQuestions} />
            </div>
          </div>
        </main>
      </div>

      {/* CTA Section - Light contrast */}
      <div className="bg-[#FAFAFA] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <CTASection
            businessId={business.id}
            businessName={business.name}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/5 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/anythingVoiceLogo.png"
              alt="AnythingVoice"
              width={100}
              height={33}
              className="brightness-0 invert opacity-50"
            />
          </Link>
          <p className="text-xs text-white/30">
            Powered by AI
          </p>
        </div>
      </footer>
    </div>
  )
}
