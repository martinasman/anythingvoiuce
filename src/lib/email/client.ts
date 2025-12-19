import { Resend } from 'resend'
import { OutreachEmail } from './templates/outreach'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendOutreachEmailParams {
  to: string
  businessName: string
  previewUrl: string
  trackingToken: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendOutreachEmail({
  to,
  businessName,
  previewUrl,
  trackingToken,
}: SendOutreachEmailParams): Promise<SendEmailResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Tracking URLs
  const openTrackingUrl = `${baseUrl}/api/track/open?token=${trackingToken}`
  const clickTrackingUrl = `${baseUrl}/api/track/click?token=${trackingToken}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'Anything Labs <hej@anythinglabs.net>',
      to: [to],
      subject: `${businessName} - Testa er AI-receptionist gratis`,
      react: OutreachEmail({
        businessName,
        previewUrl: clickTrackingUrl,
        openTrackingUrl,
      }),
    })

    if (error) {
      console.error('Resend error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function sendBatchOutreachEmails(
  emails: SendOutreachEmailParams[]
): Promise<{ results: SendEmailResult[]; successCount: number; failureCount: number }> {
  const results: SendEmailResult[] = []
  let successCount = 0
  let failureCount = 0

  for (const email of emails) {
    // Small delay between emails to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 200))

    const result = await sendOutreachEmail(email)
    results.push(result)

    if (result.success) {
      successCount++
    } else {
      failureCount++
    }
  }

  return { results, successCount, failureCount }
}
