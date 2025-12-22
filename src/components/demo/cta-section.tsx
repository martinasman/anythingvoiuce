'use client'

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
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          Nästa steg
        </span>
      </div>

      <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
        Gillade du vad du hörde?
      </h3>
      <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto">
        Boka ett kort samtal så berättar vi hur{' '}
        <span className="text-slate-900 font-semibold">{businessName}</span>{' '}
        kan få en egen AI-receptionist.
      </p>

      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleCalendlyClick}
        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
      >
        Boka ett samtal
        <svg
          className="w-5 h-5 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>

      <p className="text-slate-400 text-sm mt-6 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        15 minuter, ingen kostnad
      </p>
    </div>
  )
}
