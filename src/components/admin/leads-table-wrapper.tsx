'use client'

import { useRouter } from 'next/navigation'
import { LeadsTable } from './leads-table'
import type { Business } from '@/types/database'

interface LeadsTableWrapperProps {
  leads: Business[]
}

export function LeadsTableWrapper({ leads }: LeadsTableWrapperProps) {
  const router = useRouter()

  const handleSendEmail = async (businessId: string, emailData?: { to: string; subject: string }) => {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        to: emailData?.to,
        subject: emailData?.subject,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Kunde inte skicka email')
    }

    router.refresh()
  }

  const handleDelete = async (businessId: string) => {
    const response = await fetch(`/api/business/${businessId}/delete`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Kunde inte ta bort')
    }

    router.refresh()
  }

  return (
    <LeadsTable
      leads={leads}
      onSendEmail={handleSendEmail}
      onDelete={handleDelete}
      onRefresh={() => router.refresh()}
    />
  )
}
