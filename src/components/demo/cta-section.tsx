'use client'

import { useEffect } from 'react'

interface CTASectionProps {
  businessId: string
  businessName: string
}

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/anythinglabs/demo'

export function CTASection({ businessId, businessName }: CTASectionProps) {
  // Track when user clicks the Calendly button
  const handleCalendlyClick = async () => {
    try {
      await fetch('/api/lead/interested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
    } catch (err) {
      // Silent fail - don't block the user from booking
      console.error('Failed to track interest:', err)
    }
  }

  return (
    <div className="text-center p-8 bg-white rounded-sm border border-slate-200 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">
        Gillade du vad du hörde?
      </h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Boka ett kort samtal så berättar vi hur{' '}
        <span className="text-slate-900 font-medium">{businessName}</span>{' '}
        kan få en egen AI-receptionist.
      </p>

      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleCalendlyClick}
        className="inline-block px-8 py-4 bg-[#1D1C1B] text-white font-semibold rounded-full hover:bg-[#3A3A3A] transition-all"
      >
        Boka ett samtal
      </a>

      <p className="text-slate-500 text-sm mt-4">
        15 minuter, ingen kostnad
      </p>
    </div>
  )
}
