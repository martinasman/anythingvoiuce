import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface VapiWebhookMessage {
  type: string
  call?: {
    id: string
    assistantId?: string
    startedAt?: string
    endedAt?: string
  }
  transcript?: string
  transcriptType?: 'partial' | 'final'
  role?: 'user' | 'assistant'
  artifact?: {
    messages?: Array<{
      role: string
      message: string
      time: number
    }>
  }
  analysis?: {
    summary?: string
  }
  durationSeconds?: number
}

export async function POST(request: NextRequest) {
  try {
    const payload: { message: VapiWebhookMessage } = await request.json()
    const message = payload.message

    if (!message) {
      return NextResponse.json({ received: true })
    }

    const supabase = await createSupabaseServerClient()

    // Find business by assistant ID
    const assistantId = message.call?.assistantId
    if (!assistantId) {
      return NextResponse.json({ received: true })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('vapi_assistant_id', assistantId)
      .single()

    if (!business) {
      console.log('No business found for assistant:', assistantId)
      return NextResponse.json({ received: true })
    }

    switch (message.type) {
      case 'status-update':
        // Call status changed - could log if needed
        break

      case 'end-of-call-report':
        // Store transcript and update call duration
        if (message.call?.id) {
          const transcriptMessages = message.artifact?.messages?.map((m) => ({
            role: m.role,
            content: m.message,
            timestamp: m.time,
          })) || []

          await supabase.from('call_transcripts').upsert({
            business_id: business.id,
            vapi_call_id: message.call.id,
            duration_seconds: message.durationSeconds || 0,
            transcript: transcriptMessages,
            summary: message.analysis?.summary || null,
          }, {
            onConflict: 'vapi_call_id',
          })

          // Update business with call info
          await supabase
            .from('businesses')
            .update({
              preview_call_duration_seconds: message.durationSeconds,
            })
            .eq('id', business.id)

          // Log event
          await supabase.from('lead_events').insert({
            business_id: business.id,
            event_type: 'call_ended',
            metadata: {
              call_id: message.call.id,
              duration_seconds: message.durationSeconds,
              has_summary: !!message.analysis?.summary,
            },
          })
        }
        break

      case 'transcript':
        // Real-time transcript - could stream to UI if needed
        break

      default:
        console.log('Unhandled Vapi webhook type:', message.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
