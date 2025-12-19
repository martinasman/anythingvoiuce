import { VapiClient } from '@vapi-ai/server-sdk'
import type { ExtractedBusinessData } from '@/lib/claude/schemas'
import { generateSystemPrompt, getFirstMessage } from './prompts'
import { getVoiceForIndustry } from './voices'

let vapi: VapiClient | null = null

function getVapiClient(): VapiClient {
  if (!vapi) {
    vapi = new VapiClient({
      token: process.env.VAPI_PRIVATE_KEY!,
    })
  }
  return vapi
}

/**
 * Get or create a Vapi phone number for inbound calls
 * Vapi phone numbers are US-based and can receive forwarded calls from 46elks
 */
export async function getOrCreateVapiPhoneNumber(): Promise<{
  success: boolean
  phoneNumber?: string
  phoneNumberId?: string
  sipUri?: string
  error?: string
}> {
  try {
    const client = getVapiClient()

    // First, try to list existing phone numbers
    const phoneNumbers = await client.phoneNumbers.list()

    // Look for an existing active phone number
    const existingNumber = phoneNumbers.find(
      (p: { provider?: string; number?: string }) => p.provider === 'vapi' && p.number
    )

    if (existingNumber) {
      return {
        success: true,
        phoneNumber: (existingNumber as { number: string }).number,
        phoneNumberId: (existingNumber as { id: string }).id,
        sipUri: (existingNumber as { sipUri?: string }).sipUri,
      }
    }

    // No existing number, try to buy one
    // Note: This requires Vapi account with phone number capabilities
    const newNumber = await client.phoneNumbers.create({
      provider: 'vapi',
      // Vapi will assign a US number
    })

    return {
      success: true,
      phoneNumber: (newNumber as { number: string }).number,
      phoneNumberId: newNumber.id,
      sipUri: (newNumber as { sipUri?: string }).sipUri,
    }
  } catch (error) {
    console.error('Failed to get/create Vapi phone number:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get phone number',
    }
  }
}

/**
 * Update Vapi phone number to use a specific assistant
 * Note: The Vapi SDK may not support direct assistant assignment.
 * The assistant ID is typically set when creating the phone number or via API call.
 */
export async function assignAssistantToPhoneNumber(
  _phoneNumberId: string,
  _assistantId: string
): Promise<{ success: boolean; error?: string }> {
  // Note: This function is a placeholder. In Vapi, the assistant is typically
  // assigned to the phone number at creation time or handled via server URL webhooks.
  // The current SDK version may not support updating assistantId directly.
  // Instead, incoming calls are routed to the correct assistant based on the
  // business lookup in our webhook.
  console.log('Note: Vapi phone number assistant assignment is handled via webhooks')
  return { success: true }
}

/**
 * Get Vapi phone number details
 */
export async function getVapiPhoneNumber(phoneNumberId: string): Promise<{
  success: boolean
  phoneNumber?: {
    id: string
    number: string
    sipUri?: string
    assistantId?: string
  }
  error?: string
}> {
  try {
    const client = getVapiClient()
    const phoneNumber = await client.phoneNumbers.get({ id: phoneNumberId })

    return {
      success: true,
      phoneNumber: {
        id: phoneNumber.id,
        number: (phoneNumber as { number: string }).number,
        sipUri: (phoneNumber as { sipUri?: string }).sipUri,
        assistantId: (phoneNumber as { assistantId?: string }).assistantId,
      },
    }
  } catch (error) {
    console.error('Failed to get Vapi phone number:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get phone number',
    }
  }
}

export interface CreateAssistantResult {
  success: boolean
  assistantId?: string
  error?: string
}

export async function createVapiAssistant(
  business: ExtractedBusinessData,
  slug: string
): Promise<CreateAssistantResult> {
  try {
    const systemPrompt = generateSystemPrompt(business)
    const firstMessage = getFirstMessage(business)

    const client = getVapiClient()
    const assistant = await client.assistants.create({
      name: `AI Receptionist - ${business.name}`,
      firstMessage: firstMessage,
      firstMessageMode: 'assistant-speaks-first',
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'sv', // Swedish
      },
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
        temperature: 0.7,
      },
      voice: {
        provider: '11labs',
        voiceId: getVoiceForIndustry(business.industry).voiceId,
        model: 'eleven_multilingual_v2',
        stability: 0.5,
        similarityBoost: 0.75,
        optimizeStreamingLatency: 3,
      },
      server: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/vapi`,
      },
      metadata: {
        slug,
        businessName: business.name,
        industry: business.industry,
      },
    })

    return {
      success: true,
      assistantId: assistant.id,
    }
  } catch (error) {
    console.error('Vapi assistant creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create assistant',
    }
  }
}

export async function deleteVapiAssistant(assistantId: string): Promise<boolean> {
  try {
    const client = getVapiClient()
    await client.assistants.delete({ id: assistantId })
    return true
  } catch (error) {
    console.error('Vapi assistant deletion error:', error)
    return false
  }
}
