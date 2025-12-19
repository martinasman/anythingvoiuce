import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import { allocateNumber, configureNumber, formatPhoneDisplay } from '@/lib/46elks/client'

/**
 * POST /api/onboarding
 *
 * Complete onboarding flow:
 * 1. Create/update business record
 * 2. Provision phone number from 46elks
 * 3. Configure phone to forward to our webhook
 * 4. Link everything together
 */
export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer()

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      businessId,      // Optional: existing business to convert
      businessName,    // Required if no businessId
      industry,        // Required if no businessId
      voiceId,         // Selected voice
      whatsappPhone,   // Optional: WhatsApp number for notifications
    } = body

    const supabase = await createSupabaseServerClient()

    // Step 1: Get or create business
    let business: { id: string; name: string; vapi_assistant_id: string | null } | null = null

    if (businessId) {
      // Use existing business
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, vapi_assistant_id')
        .eq('id', businessId)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Business not found' },
          { status: 404 }
        )
      }

      business = data
    } else if (businessName) {
      // Create new business
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          source_url: 'manual',
          name: businessName,
          industry: industry || 'other',
          customer_id: customer.id,
          status: 'pending',
        })
        .select('id, name, vapi_assistant_id')
        .single()

      if (error || !data) {
        console.error('Failed to create business:', error)
        return NextResponse.json(
          { error: 'Failed to create business' },
          { status: 500 }
        )
      }

      business = data
    } else {
      return NextResponse.json(
        { error: 'Business ID or name is required' },
        { status: 400 }
      )
    }

    // Step 2: Link business to customer
    await supabase
      .from('businesses')
      .update({
        customer_id: customer.id,
        voice_id: voiceId || null,
      })
      .eq('id', business.id)

    // Step 3: Allocate phone number from 46elks
    const allocateResult = await allocateNumber({ country: 'se', voice: true })

    if (!allocateResult.success) {
      console.error('Failed to allocate phone number:', allocateResult.error)
      return NextResponse.json(
        { error: 'Failed to allocate phone number: ' + allocateResult.error },
        { status: 500 }
      )
    }

    const elksNumber = allocateResult.number

    // Step 4: Configure phone number to forward to our webhook
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/46elks`
    const configResult = await configureNumber(elksNumber.id, {
      voice_start: webhookUrl,
    })

    if (!configResult.success) {
      console.error('Failed to configure phone number:', configResult.error)
      // Don't fail completely - the number is allocated, just not configured
    }

    // Step 5: Store phone number in database
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .insert({
        customer_id: customer.id,
        business_id: business.id,
        phone_number: elksNumber.number,
        phone_number_display: formatPhoneDisplay(elksNumber.number),
        country_code: 'SE',
        provider: '46elks',
        provider_number_id: elksNumber.id,
        provider_config: { voice_start: webhookUrl },
        status: 'active',
        activated_at: new Date().toISOString(),
        monthly_cost_cents: 300, // ~3 EUR
      })
      .select()
      .single()

    if (phoneError) {
      console.error('Failed to store phone number:', phoneError)
      return NextResponse.json(
        { error: 'Failed to store phone number' },
        { status: 500 }
      )
    }

    // Step 6: Update business as production-enabled
    await supabase
      .from('businesses')
      .update({
        is_production: true,
        production_enabled_at: new Date().toISOString(),
        status: 'agent_created',
      })
      .eq('id', business.id)

    // Step 7: Update customer with WhatsApp if provided
    if (whatsappPhone) {
      await supabase
        .from('customers')
        .update({
          whatsapp_phone: whatsappPhone,
          whatsapp_notifications_enabled: true,
        })
        .eq('id', customer.id)
    }

    // Step 8: Log onboarding event
    await supabase.from('lead_events').insert({
      business_id: business.id,
      event_type: 'production_enabled',
      metadata: {
        customer_id: customer.id,
        phone_number: elksNumber.number,
        voice_id: voiceId,
        whatsapp_enabled: !!whatsappPhone,
      },
    })

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
      },
      phoneNumber: {
        id: phoneNumber.id,
        number: phoneNumber.phone_number,
        display: phoneNumber.phone_number_display,
      },
      dashboardUrl: '/dashboard',
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
