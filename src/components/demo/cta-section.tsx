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
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      console.error('Error submitting interest:', err)
      setError('Could not send request')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-emerald-50 rounded-sm border border-emerald-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-emerald-600"
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
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank you for your interest!</h3>
        <p className="text-slate-600">
          We&apos;ll contact you shortly to discuss how we can help{' '}
          <span className="text-slate-900 font-medium">{businessName}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center p-8 bg-white rounded-sm border border-slate-200 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Like what you hear?</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Let us show you how an AI receptionist can help{' '}
        <span className="text-slate-900 font-medium">{businessName}</span> never miss a call.
      </p>

      {error && (
        <p className="text-rose-500 text-sm mb-4">{error}</p>
      )}

      <button
        onClick={handleInterest}
        disabled={isLoading}
        className="px-8 py-4 bg-[#5A9BC7] text-white font-semibold rounded-sm hover:bg-[#4683AE] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            Sending...
          </span>
        ) : (
          'I\'m interested - contact me!'
        )}
      </button>

      <p className="text-slate-500 text-sm mt-4">
        We&apos;ll get back to you within 24 hours
      </p>
    </div>
  )
}
