'use client'

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 px-6 py-4 bg-white">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <span className="text-xs font-semibold text-[#5A9BC7] uppercase tracking-wider">
              AI Receptionist Demo
            </span>
            <h1 className="text-2xl font-bold mt-1 text-slate-900">{business.name}</h1>
          </div>
          <Link
            href="/"
            className="ml-6 flex items-center gap-2 px-4 py-2 bg-[#5A9BC7] hover:bg-[#4683AE] text-white rounded-sm transition-colors font-medium text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Main Website
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Description */}
          {business.description && (
            <div className="text-center">
              <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                {business.description}
              </p>
            </div>
          )}

          {/* Call Interface */}
          <div className="flex justify-center py-8">
            <CallButton
              status={status}
              volumeLevel={volumeLevel}
              onStart={startCall}
              onEnd={endCall}
            />
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="bg-white rounded-sm p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Transcript
              </h3>
              <div className="space-y-2 text-sm text-slate-600 font-mono whitespace-pre-wrap">
                {transcript}
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          <div className="flex justify-center">
            <SuggestedQuestions questions={suggestedQuestions} />
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
      <footer className="border-t border-slate-200 px-6 py-8 mt-12 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            Powered by{' '}
            <a
              href="https://anythinglabs.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5A9BC7] hover:text-[#4683AE] transition-colors"
            >
              Anything Labs
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
