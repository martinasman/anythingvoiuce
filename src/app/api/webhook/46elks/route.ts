import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * 46elks Webhook Handler
 *
 * This endpoint handles incoming call events from 46elks.
 * When a call comes in to an allocated Swedish number, 46elks calls this webhook
 * and we respond with instructions to connect the call to the Vapi US number.
 *
 * Call flow:
 * 1. Customer calls Swedish 46elks number
 * 2. 46elks sends webhook to this endpoint
 * 3. We look up the business and its Vapi configuration
 * 4. We return JSON telling 46elks to connect to Vapi's US phone number
 * 5. Vapi handles the call with the AI assistant
 * 6. Vapi sends end-of-call webhook to /api/webhook/vapi
 */

export async function POST(request: NextRequest) {
  try {
    // 46elks sends form-urlencoded data
    const formData = await request.formData()

    const callid = formData.get('callid') as string
    const direction = formData.get('direction') as string
    const from = formData.get('from') as string
    const to = formData.get('to') as string
    const result = formData.get('result') as string | null

    console.log('[46elks webhook]', { callid, direction, from, to, result })

    // If this is a call result notification (call ended), just acknowledge
    if (result) {
      console.log('[46elks] Call ended:', { callid, result, duration: formData.get('duration') })
      return NextResponse.json({ status: 'ok' })
    }

    // This is an incoming call - find the phone number and business
    const supabase = await createSupabaseServerClient()

    // Look up the phone number to find the associated business
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select(`
        id,
        customer_id,
        business_id,
        provider_config,
        vapi_phone_number,
        vapi_phone_number_id
      `)
      .eq('phone_number', to)
      .eq('status', 'active')
      .single()

    if (phoneError || !phoneNumber) {
      console.error('[46elks] Phone number not found:', to)
      // Return a message saying the number is not in service
      return new NextResponse(
        JSON.stringify({
          say: 'Det nummer du har ringt är inte i tjänst.',
          voice: 'Elvira',
          next: { hangup: 'reject' },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the business and its Vapi assistant
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, vapi_assistant_id, name')
      .eq('id', phoneNumber.business_id)
      .single()

    if (businessError || !business?.vapi_assistant_id) {
      console.error('[46elks] Business or assistant not found:', phoneNumber.business_id)
      return new NextResponse(
        JSON.stringify({
          say: 'Tyvärr kan vi inte koppla ditt samtal just nu. Försök igen senare.',
          voice: 'Elvira',
          next: { hangup: 'reject' },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Log the incoming call (initial record - will be updated by Vapi webhook)
    const { data: callRecord } = await supabase.from('customer_calls').insert({
      customer_id: phoneNumber.customer_id,
      business_id: business.id,
      phone_number_id: phoneNumber.id,
      direction: 'inbound',
      caller_phone: from,
      started_at: new Date().toISOString(),
      provider_call_id: callid, // 46elks call ID
    }).select('id').single()

    console.log('[46elks] Created call record:', callRecord?.id)

    // Determine where to connect the call
    // Priority: 1) Phone number's specific Vapi number, 2) Global Vapi number, 3) Error

    const vapiPhoneNumber = (phoneNumber as { vapi_phone_number?: string }).vapi_phone_number || process.env.VAPI_PHONE_NUMBER

    if (vapiPhoneNumber) {
      console.log('[46elks] Connecting to Vapi phone:', vapiPhoneNumber)

      // Connect to Vapi's US phone number
      // 46elks will forward the call to this number, and Vapi will handle it
      return new NextResponse(
        JSON.stringify({
          connect: vapiPhoneNumber,
          callerid: from, // Pass through original caller ID
          timeout: 30, // 30 seconds to connect
          busy: {
            say: 'Numret är upptaget. Försök igen senare.',
            voice: 'Elvira',
          },
          failed: {
            say: 'Kunde inte koppla samtalet. Försök igen senare.',
            voice: 'Elvira',
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fallback: No Vapi phone number configured
    console.error('[46elks] No Vapi phone number configured for:', to)
    return new NextResponse(
      JSON.stringify({
        say: 'Vår AI-receptionist är inte tillgänglig just nu. Försök igen senare.',
        voice: 'Elvira',
        next: { hangup: 'reject' },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[46elks webhook] Error:', error)
    return new NextResponse(
      JSON.stringify({
        say: 'Ett tekniskt fel uppstod. Försök igen senare.',
        voice: 'Elvira',
        next: { hangup: 'reject' },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Also handle GET for webhook verification if needed
export async function GET() {
  return NextResponse.json({ status: 'ok', service: '46elks-webhook' })
}
