/**
 * 46elks API Client
 * Documentation: https://46elks.com/docs
 *
 * This client handles Swedish phone number provisioning and configuration
 * for routing inbound calls to Vapi AI assistants.
 */

const ELKS_API_URL = 'https://api.46elks.com/a1'

interface ElksNumber {
  id: string
  number: string
  country: string
  active: 'yes' | 'no'
  created: string
  voice_start?: string
  sms_url?: string
}

interface AllocateNumberOptions {
  country?: string  // Default: 'se' (Sweden)
  sms?: boolean     // Enable SMS capability
  voice?: boolean   // Enable voice capability (default true)
}

interface ConfigureNumberOptions {
  voice_start?: string  // Webhook URL for incoming calls
  sms_url?: string      // Webhook URL for incoming SMS
}

interface ElksCallWebhook {
  callid: string
  direction: 'incoming' | 'outgoing'
  from: string
  to: string
  created: string
  result?: string
  duration?: string
  cost?: string
}

/**
 * Get auth header for 46elks API
 */
function getAuthHeader(): string {
  const username = process.env.ELKS_API_USERNAME
  const password = process.env.ELKS_API_PASSWORD

  if (!username || !password) {
    throw new Error('46elks credentials not configured. Set ELKS_API_USERNAME and ELKS_API_PASSWORD environment variables.')
  }

  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
}

/**
 * Make API request to 46elks
 */
async function elksRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  data?: Record<string, string>
): Promise<T> {
  const url = `${ELKS_API_URL}${endpoint}`

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': getAuthHeader(),
    },
  }

  if (data && method === 'POST') {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    options.body = new URLSearchParams(data).toString()
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`46elks API error: ${response.status} - ${error}`)
  }

  return response.json()
}

/**
 * Allocate a new Swedish phone number
 */
export async function allocateNumber(
  options: AllocateNumberOptions = {}
): Promise<{ success: true; number: ElksNumber } | { success: false; error: string }> {
  try {
    const { country = 'se', sms = false, voice = true } = options

    const capabilities: string[] = []
    if (voice) capabilities.push('voice')
    if (sms) capabilities.push('sms')

    const number = await elksRequest<ElksNumber>('/numbers', 'POST', {
      country,
      capabilities: capabilities.join(','),
    })

    return { success: true, number }
  } catch (error) {
    console.error('Failed to allocate number:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to allocate number',
    }
  }
}

/**
 * Configure a phone number with webhook URLs
 */
export async function configureNumber(
  numberId: string,
  config: ConfigureNumberOptions
): Promise<{ success: true; number: ElksNumber } | { success: false; error: string }> {
  try {
    const data: Record<string, string> = {}

    if (config.voice_start) {
      data.voice_start = config.voice_start
    }
    if (config.sms_url) {
      data.sms_url = config.sms_url
    }

    const number = await elksRequest<ElksNumber>(`/numbers/${numberId}`, 'POST', data)

    return { success: true, number }
  } catch (error) {
    console.error('Failed to configure number:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to configure number',
    }
  }
}

/**
 * Deallocate (release) a phone number
 */
export async function deallocateNumber(
  numberId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await elksRequest(`/numbers/${numberId}`, 'POST', {
      active: 'no',
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to deallocate number:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deallocate number',
    }
  }
}

/**
 * Get details for a specific phone number
 */
export async function getNumberDetails(
  numberId: string
): Promise<{ success: true; number: ElksNumber } | { success: false; error: string }> {
  try {
    const number = await elksRequest<ElksNumber>(`/numbers/${numberId}`)
    return { success: true, number }
  } catch (error) {
    console.error('Failed to get number details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get number details',
    }
  }
}

/**
 * List all allocated phone numbers
 */
export async function listNumbers(): Promise<{ success: true; numbers: ElksNumber[] } | { success: false; error: string }> {
  try {
    const response = await elksRequest<{ data: ElksNumber[] }>('/numbers')
    return { success: true, numbers: response.data || [] }
  } catch (error) {
    console.error('Failed to list numbers:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list numbers',
    }
  }
}

/**
 * Generate TwiML-style response to connect call to Vapi
 * This is the response format 46elks expects for voice_start webhook
 */
export function generateCallConnectResponse(vapiPhoneNumber: string): string {
  // 46elks uses a simple JSON format for call routing
  // Connect to Vapi's phone number or SIP endpoint
  return JSON.stringify({
    connect: vapiPhoneNumber,
  })
}

/**
 * Generate IVR response with Vapi SIP URI
 * Alternative: Connect via SIP to Vapi's servers
 */
export function generateSipConnectResponse(sipUri: string): string {
  return JSON.stringify({
    connect: sipUri,
    callerid: 'inherit', // Keep original caller ID
  })
}

/**
 * Format Swedish phone number to E.164 format
 */
export function formatSwedishNumber(number: string): string {
  // Remove all non-digit characters
  let cleaned = number.replace(/\D/g, '')

  // Handle Swedish formats
  if (cleaned.startsWith('46')) {
    return '+' + cleaned
  }
  if (cleaned.startsWith('0')) {
    return '+46' + cleaned.substring(1)
  }

  // Assume it's already without country code
  return '+46' + cleaned
}

/**
 * Format phone number for display (Swedish style)
 */
export function formatPhoneDisplay(e164: string): string {
  // +46701234567 -> 070-123 45 67
  if (!e164.startsWith('+46')) {
    return e164
  }

  const nationalNumber = e164.substring(3)

  // Mobile numbers (7x)
  if (nationalNumber.startsWith('7')) {
    const match = nationalNumber.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/)
    if (match) {
      return `0${match[1]}-${match[2]} ${match[3]} ${match[4]}`
    }
  }

  // Landline numbers (various lengths)
  // Just add 0 prefix and format with dashes
  return '0' + nationalNumber.replace(/(\d{2,3})(\d{3})(\d{2})(\d{2})?/, '$1-$2 $3 $4').trim()
}

// Export types for use elsewhere
export type { ElksNumber, ElksCallWebhook, AllocateNumberOptions, ConfigureNumberOptions }
