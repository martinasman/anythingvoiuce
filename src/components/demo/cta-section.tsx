'use client'

import { useState } from 'react'

interface CTASectionProps {
  businessId: string
  businessName: string
}

export function CTASection({ businessId, businessName }: CTASectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInterest = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/lead/interested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Något gick fel')
      }
    } catch (err) {
      console.error('Error submitting interest:', err)
      setError('Kunde inte skicka förfrågan')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-green-900/20 rounded-2xl border border-green-500/30">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Tack för ditt intresse!</h3>
        <p className="text-zinc-300">
          Vi kontaktar dig inom kort för att diskutera hur vi kan hjälpa{' '}
          <span className="text-white font-medium">{businessName}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center p-8 bg-zinc-900 rounded-2xl border border-zinc-700">
      <h3 className="text-2xl font-bold text-white mb-2">Gillar du det du hör?</h3>
      <p className="text-zinc-300 mb-6 max-w-md mx-auto">
        Låt oss visa hur en AI-receptionist kan hjälpa{' '}
        <span className="text-white font-medium">{businessName}</span> att aldrig missa ett samtal.
      </p>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      <button
        onClick={handleInterest}
        disabled={isLoading}
        className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Skickar...
          </span>
        ) : (
          'Jag är intresserad - kontakta mig!'
        )}
      </button>

      <p className="text-zinc-500 text-sm mt-4">
        Vi hör av oss inom 24 timmar
      </p>
    </div>
  )
}
