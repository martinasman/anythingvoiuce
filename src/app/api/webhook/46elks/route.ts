import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * 46elks Webhook Handler
 *
 * This endpoint handles incoming call events from 46elks.
 * When a call comes in to an allocated number, 46elks calls this webhook
 * and we respond with instructions to connect the call to Vapi.
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
        provider_config
      `)
      .eq('phone_number', to)
      .eq('status', 'active')
      .single()

    if (phoneError || !phoneNumber) {
      console.error('[46elks] Phone number not found:', to)
      // Return a message saying the number is not in service
      return new NextResponse(
        JSON.stringify({
          play: 'https://api.twilio.com/cowbell.mp3', // Placeholder - should use a proper "not in service" message
          next: JSON.stringify({ hangup: 'reject' }),
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
        JSON.stringify({ hangup: 'reject' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Log the incoming call
    await supabase.from('customer_calls').insert({
      customer_id: phoneNumber.customer_id,
      business_id: business.id,
      phone_number_id: phoneNumber.id,
      direction: 'inbound',
      caller_phone: from,
      started_at: new Date().toISOString(),
    })

    // Get Vapi's phone configuration
    // Vapi assistants can be reached via their phone number or SIP
    // For now, we'll use Vapi's web calling by redirecting through our app
    // In production, you'd configure Vapi with a phone number and connect via SIP

    // Option 1: Connect to Vapi phone number (if you have one configured)
    const vapiPhoneNumber = process.env.VAPI_PHONE_NUMBER
    if (vapiPhoneNumber) {
      return new NextResponse(
        JSON.stringify({
          connect: vapiPhoneNumber,
          callerid: from, // Pass through caller ID
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Option 2: Use SIP connection to Vapi (requires Vapi SIP configuration)
    const vapiSipUri = process.env.VAPI_SIP_URI
    if (vapiSipUri) {
      // Include the assistant ID in the SIP headers
      return new NextResponse(
        JSON.stringify({
          connect: `${vapiSipUri}?assistant_id=${business.vapi_assistant_id}`,
          callerid: from,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Option 3: Webhook-based integration
    // Store the call info and let Vapi initiate an outbound call
    // This is a fallback when direct phone/SIP isn't available
    console.log('[46elks] No Vapi phone/SIP configured, using webhook mode')

    // For now, play a message and we'll handle this through Vapi's web SDK
    // In production, you'd set up proper phone/SIP integration
    return new NextResponse(
      JSON.stringify({
        say: 'Tack för ditt samtal. Vi kopplar dig nu.',
        voice: 'Elvira',
        next: JSON.stringify({
          // This would connect to a configured fallback number
          // For now, we'll just say we're transferring
          say: 'Ett ögonblick.',
          voice: 'Elvira',
        }),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[46elks webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also handle GET for webhook verification if needed
export async function GET() {
  return NextResponse.json({ status: 'ok', service: '46elks-webhook' })
}
