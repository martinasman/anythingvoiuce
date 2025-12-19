/**
 * WhatsApp Cloud API Client
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * This client handles sending WhatsApp notifications for call summaries.
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface CallSummary {
  businessName: string
  callerPhone: string
  callerName?: string
  duration: string
  summary: string
  topic?: string
}

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Get WhatsApp API configuration
 */
function getConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp API not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN.')
  }

  return { phoneNumberId, accessToken }
}

/**
 * Format phone number for WhatsApp API (remove + and spaces)
 */
function formatPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/**
 * Send a call notification to WhatsApp
 */
export async function sendCallNotification(
  to: string,
  callSummary: CallSummary
): Promise<SendMessageResult> {
  try {
    const { phoneNumberId, accessToken } = getConfig()
    const formattedPhone = formatPhoneNumber(to)

    // First, try to send a template message (required for initiating conversations)
    const templateResult = await sendTemplateMessage(
      formattedPhone,
      'call_notification',
      [
        callSummary.businessName,
        callSummary.callerName || callSummary.callerPhone,
        callSummary.duration,
        callSummary.summary.substring(0, 500), // WhatsApp has character limits
      ]
    )

    return templateResult
  } catch (error) {
    console.error('WhatsApp notification error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send WhatsApp notification',
    }
  }
}

/**
 * Send a template message
 * Templates must be pre-approved by Meta
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  parameters: string[]
): Promise<SendMessageResult> {
  try {
    const { phoneNumberId, accessToken } = getConfig()
    const formattedPhone = formatPhoneNumber(to)

    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'sv' },
            components: [
              {
                type: 'body',
                parameters: parameters.map(text => ({
                  type: 'text',
                  text,
                })),
              },
            ],
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('WhatsApp API error:', error)
      return {
        success: false,
        error: error.error?.message || 'WhatsApp API error',
      }
    }

    const result = await response.json()
    return {
      success: true,
      messageId: result.messages?.[0]?.id,
    }
  } catch (error) {
    console.error('WhatsApp template error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send template message',
    }
  }
}

/**
 * Send a simple text message (only works within 24-hour window)
 */
export async function sendTextMessage(
  to: string,
  text: string
): Promise<SendMessageResult> {
  try {
    const { phoneNumberId, accessToken } = getConfig()
    const formattedPhone = formatPhoneNumber(to)

    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: text },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('WhatsApp API error:', error)
      return {
        success: false,
        error: error.error?.message || 'WhatsApp API error',
      }
    }

    const result = await response.json()
    return {
      success: true,
      messageId: result.messages?.[0]?.id,
    }
  } catch (error) {
    console.error('WhatsApp text error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send text message',
    }
  }
}

/**
 * Verify webhook callback (for receiving messages/status updates)
 */
export function verifyWebhook(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    return challenge
  }

  return null
}

/**
 * Check if WhatsApp is configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ACCESS_TOKEN
  )
}

/**
 * Format call duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins} min ${secs} sek`
}

// Export types
export type { CallSummary, SendMessageResult }
