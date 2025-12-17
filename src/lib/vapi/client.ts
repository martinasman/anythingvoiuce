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
