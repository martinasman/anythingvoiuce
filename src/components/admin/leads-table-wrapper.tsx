'use client'

import { useRouter } from 'next/navigation'
import { LeadsTable } from './leads-table'
import type { Business } from '@/types/database'

interface LeadsTableWrapperProps {
  leads: Business[]
}

export function LeadsTableWrapper({ leads }: LeadsTableWrapperProps) {
  const router = useRouter()

  const handleSendEmail = async (businessId: string) => {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Fel: ${data.error || 'Kunde inte skicka email'}`)
        return
      }

      alert(`Email skickat till ${data.sentTo}`)
      router.refresh()
    } catch (error) {
      console.error('Send email error:', error)
      alert('Ett fel uppstod vid skickande av email')
    }
  }

  return <LeadsTable leads={leads} onSendEmail={handleSendEmail} />
}
