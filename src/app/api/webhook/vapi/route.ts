import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendCallNotification as sendWhatsAppCallNotification, formatDuration, isWhatsAppConfigured } from '@/lib/whatsapp/client'
import { sendCallNotification as sendTelegramCallNotification, formatDurationForTelegram } from '@/lib/telegram/client'

interface VapiWebhookMessage {
  type: string
  call?: {
    id: string
    assistantId?: string
    startedAt?: string
    endedAt?: string
    customer?: {
      number?: string
      name?: string
    }
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
    structuredData?: {
      topic?: string
      sentiment?: string
      actionItems?: Array<{ description: string; priority?: string }>
      followUpRequired?: boolean
    }
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
      .select('id, name, customer_id, is_production')
      .eq('vapi_assistant_id', assistantId)
      .single()

    if (!business) {
      console.log('No business found for assistant:', assistantId)
      return NextResponse.json({ received: true })
    }

    const isProductionCall = business.is_production && business.customer_id

    switch (message.type) {
      case 'status-update':
        // Call status changed - could log if needed
        break

      case 'end-of-call-report':
        if (message.call?.id) {
          const transcriptMessages = message.artifact?.messages?.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.message,
            timestamp: m.time,
          })) || []

          const summary = message.analysis?.summary || null
          const structuredData = message.analysis?.structuredData
          const durationSeconds = message.durationSeconds || 0

          if (isProductionCall) {
            // Production call - store in customer_calls table
            const { data: callRecord, error: callError } = await supabase
              .from('customer_calls')
              .upsert({
                customer_id: business.customer_id,
                business_id: business.id,
                vapi_call_id: message.call.id,
                direction: 'inbound',
                caller_phone: message.call.customer?.number || null,
                caller_name: message.call.customer?.name || null,
                started_at: message.call.startedAt || null,
                ended_at: message.call.endedAt || null,
                duration_seconds: durationSeconds,
                transcript: transcriptMessages,
                summary,
                topic: structuredData?.topic || null,
                sentiment: (structuredData?.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
                action_items: structuredData?.actionItems || [],
                follow_up_required: structuredData?.followUpRequired || false,
                // Calculate cost (approximate: $0.12/min)
                cost_cents: Math.round((durationSeconds / 60) * 12),
              }, {
                onConflict: 'vapi_call_id',
              })
              .select()
              .single()

            if (callError) {
              console.error('Error storing production call:', callError)
            }

            // Send notifications if enabled
            if (callRecord) {
              // WhatsApp notification
              if (isWhatsAppConfigured()) {
                await sendWhatsAppNotification(supabase, business, callRecord, summary, durationSeconds, structuredData)
              }

              // Telegram notification
              await sendTelegramNotification(supabase, business, callRecord, summary, durationSeconds, structuredData)
            }

            // Update usage records
            await updateUsageRecords(supabase, business.customer_id!, durationSeconds)

            // Log event
            await supabase.from('lead_events').insert({
              business_id: business.id,
              event_type: 'production_call_ended',
              metadata: {
                call_id: message.call.id,
                customer_id: business.customer_id,
                duration_seconds: durationSeconds,
                has_summary: !!summary,
                sentiment: structuredData?.sentiment,
              },
            })
          } else {
            // Demo call - store in call_transcripts table (existing behavior)
            await supabase.from('call_transcripts').upsert({
              business_id: business.id,
              vapi_call_id: message.call.id,
              duration_seconds: durationSeconds,
              transcript: transcriptMessages,
              summary,
              call_type: 'demo',
            }, {
              onConflict: 'vapi_call_id',
            })

            // Update business with call info
            await supabase
              .from('businesses')
              .update({
                preview_call_duration_seconds: durationSeconds,
              })
              .eq('id', business.id)

            // Log event
            await supabase.from('lead_events').insert({
              business_id: business.id,
              event_type: 'call_ended',
              metadata: {
                call_id: message.call.id,
                duration_seconds: durationSeconds,
                has_summary: !!summary,
              },
            })
          }
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

interface StructuredData {
  topic?: string
  sentiment?: string
  actionItems?: Array<{ description: string; priority?: string }>
  followUpRequired?: boolean
}

/**
 * Send WhatsApp notification to customer
 */
async function sendWhatsAppNotification(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  business: { id: string; name: string | null; customer_id: string | null },
  callRecord: { id: string; caller_phone: string | null; caller_name: string | null },
  summary: string | null,
  durationSeconds: number,
  structuredData?: StructuredData
) {
  if (!business.customer_id) return

  // Get customer's WhatsApp settings
  const { data: customer } = await supabase
    .from('customers')
    .select('whatsapp_phone, whatsapp_notifications_enabled')
    .eq('id', business.customer_id)
    .single()

  if (!customer?.whatsapp_notifications_enabled || !customer.whatsapp_phone) {
    return
  }

  try {
    const result = await sendWhatsAppCallNotification(customer.whatsapp_phone, {
      businessName: business.name || 'Ditt företag',
      callerPhone: callRecord.caller_phone || 'Okänt nummer',
      callerName: callRecord.caller_name || undefined,
      duration: formatDuration(durationSeconds),
      summary: summary || 'Ingen sammanfattning tillgänglig',
    })

    if (result.success) {
      // Mark as notified
      await supabase
        .from('customer_calls')
        .update({ whatsapp_notified_at: new Date().toISOString() })
        .eq('id', callRecord.id)
    } else {
      console.error('WhatsApp notification failed:', result.error)
    }
  } catch (error) {
    console.error('WhatsApp notification error:', error)
  }
}

/**
 * Send Telegram notification to customer
 */
async function sendTelegramNotification(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  business: { id: string; name: string | null; customer_id: string | null },
  callRecord: { id: string; caller_phone: string | null; caller_name: string | null },
  summary: string | null,
  durationSeconds: number,
  structuredData?: StructuredData
) {
  if (!business.customer_id) return

  // Check if Telegram bot is configured
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return
  }

  // Get customer's Telegram settings
  const { data: customer } = await supabase
    .from('customers')
    .select('telegram_chat_id, telegram_notifications_enabled')
    .eq('id', business.customer_id)
    .single()

  if (!customer?.telegram_notifications_enabled || !customer.telegram_chat_id) {
    return
  }

  try {
    const result = await sendTelegramCallNotification(customer.telegram_chat_id, {
      businessName: business.name || 'Ditt företag',
      callerPhone: callRecord.caller_phone || 'Okänt nummer',
      duration: formatDurationForTelegram(durationSeconds),
      summary: summary || 'Ingen sammanfattning tillgänglig',
      topic: structuredData?.topic,
      sentiment: structuredData?.sentiment as 'positive' | 'neutral' | 'negative' | undefined,
      timestamp: new Date(),
    })

    if (result.success) {
      // Mark as notified
      await supabase
        .from('customer_calls')
        .update({ telegram_notified_at: new Date().toISOString() })
        .eq('id', callRecord.id)
    } else {
      console.error('Telegram notification failed:', result.error)
    }
  } catch (error) {
    console.error('Telegram notification error:', error)
  }
}

/**
 * Update monthly usage records
 */
async function updateUsageRecords(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  customerId: string,
  durationSeconds: number
) {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const durationMinutes = Math.ceil(durationSeconds / 60)
  const vapiCostCents = Math.round(durationMinutes * 12) // ~$0.12/min

  // Try to update existing record
  const { data: existing } = await supabase
    .from('usage_records')
    .select('id')
    .eq('customer_id', customerId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single()

  if (existing) {
    // Update existing record
    await supabase.rpc('increment_usage', {
      record_id: existing.id,
      calls: 1,
      minutes: durationMinutes,
      vapi_cost: vapiCostCents,
    })
  } else {
    // Create new record
    await supabase.from('usage_records').insert({
      customer_id: customerId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      total_calls: 1,
      total_minutes: durationMinutes,
      total_cost_cents: vapiCostCents,
      vapi_cost_cents: vapiCostCents,
    })
  }
}
