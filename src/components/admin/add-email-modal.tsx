'use client'

import { useState } from 'react'

interface AddEmailModalProps {
  businessId: string
  businessName: string
  onClose: () => void
  onSuccess: () => void
}

export function AddEmailModal({
  businessId,
  businessName,
  onClose,
  onSuccess,
}: AddEmailModalProps) {
  const [email, setEmail] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email && !contactEmail) {
      setError('At least one email is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contact_email: contactEmail }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm border border-slate-200 p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Add email for {businessName}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Business email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@company.com"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5A9BC7] focus:ring-1 focus:ring-[#5A9BC7]"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Contact person email (recommended)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5A9BC7] focus:ring-1 focus:ring-[#5A9BC7]"
            />
            <p className="text-xs text-slate-400 mt-1">
              Used for outreach emails
            </p>
          </div>

          {error && <p className="text-rose-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5A9BC7] hover:bg-[#4683AE] text-white rounded-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
