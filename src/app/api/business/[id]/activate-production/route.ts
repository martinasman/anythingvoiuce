import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { allocateNumber, configureNumber, formatPhoneDisplay } from '@/lib/46elks/client'
import { getOrCreateVapiPhoneNumber, assignAssistantToPhoneNumber } from '@/lib/vapi/client'

/**
 * POST /api/business/[id]/activate-production
 *
 * Convert a demo business to a production customer:
 * 1. Create customer record (if not exists)
 * 2. Get/create Vapi US phone number
 * 3. Allocate Swedish 46elks number
 * 4. Configure 46elks to forward to our webhook
 * 5. Link Vapi assistant to phone number
 * 6. Update business as production
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { customerEmail, customerName, voiceId, whatsappPhone, telegramChatId } = body

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Step 1: Get the business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    if (!business.vapi_assistant_id) {
      return NextResponse.json(
        { error: 'Business does not have a Vapi assistant. Create the agent first.' },
        { status: 400 }
      )
    }

    if (business.is_production) {
      return NextResponse.json(
        { error: 'Business is already in production' },
        { status: 400 }
      )
    }

    // Step 2: Get or create customer
    let customerId: string

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id

      // Update customer info
      await supabase
        .from('customers')
        .update({
          name: customerName || null,
          whatsapp_phone: whatsappPhone || null,
          whatsapp_notifications_enabled: !!whatsappPhone,
          telegram_chat_id: telegramChatId || null,
          telegram_notifications_enabled: !!telegramChatId,
        })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          email: customerEmail,
          name: customerName || null,
          whatsapp_phone: whatsappPhone || null,
          whatsapp_notifications_enabled: !!whatsappPhone,
          telegram_chat_id: telegramChatId || null,
          telegram_notifications_enabled: !!telegramChatId,
        })
        .select('id')
        .single()

      if (createError || !newCustomer) {
        console.error('Failed to create customer:', createError)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Step 3: Get or create Vapi phone number
    let vapiPhoneNumber: string | null = process.env.VAPI_PHONE_NUMBER || null
    let vapiPhoneNumberId: string | null = process.env.VAPI_PHONE_NUMBER_ID || null

    if (!vapiPhoneNumber) {
      const vapiResult = await getOrCreateVapiPhoneNumber()
      if (vapiResult.success) {
        vapiPhoneNumber = vapiResult.phoneNumber || null
        vapiPhoneNumberId = vapiResult.phoneNumberId || null
      } else {
        console.warn('Could not get Vapi phone number:', vapiResult.error)
      }
    }

    // Step 4: Assign assistant to Vapi phone number
    if (vapiPhoneNumberId && business.vapi_assistant_id) {
      const assignResult = await assignAssistantToPhoneNumber(
        vapiPhoneNumberId,
        business.vapi_assistant_id
      )
      if (!assignResult.success) {
        console.warn('Could not assign assistant to Vapi phone:', assignResult.error)
      }
    }

    // ⚠️ DISABLED: Automatic number allocation - DO NOT BUY NUMBERS AUTOMATICALLY!
    // Step 5: Allocate Swedish 46elks number - COMMENTED OUT TO PREVENT COSTS
    //
    // MANUAL SETUP REQUIRED:
    // 1. Manually allocate a 46elks number at https://46elks.com
    // 2. Configure webhook via update-46elks-webhook.js script
    // 3. Add phone number record to database manually
    //
    // const allocateResult = await allocateNumber({ country: 'se', voice: true })
    // if (!allocateResult.success) {
    //   return NextResponse.json({ error: 'Failed to allocate Swedish phone number' }, { status: 500 })
    // }
    // const elksNumber = allocateResult.number

    // For now, return error instructing manual setup
    return NextResponse.json(
      {
        error: 'Automatic phone allocation is disabled. Please contact admin to manually allocate a phone number.',
        manualSteps: [
          '1. Allocate 46elks number at https://46elks.com',
          '2. Run: node update-46elks-webhook.js <production-url>',
          '3. Contact admin to complete setup'
        ]
      },
      { status: 400 }
    )

    // COMMENTED OUT - DO NOT UNCOMMENT WITHOUT APPROVAL
    // const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/46elks`
    // const configResult = await configureNumber(elksNumber.id, { voice_start: webhookUrl })
    // const { data: phoneNumber } = await supabase.from('phone_numbers').insert({...})

    // Step 8: Update business
    await supabase
      .from('businesses')
      .update({
        customer_id: customerId,
        is_production: true,
        production_enabled_at: new Date().toISOString(),
        status: 'customer',
        voice_id: voiceId || business.voice_id,
      })
      .eq('id', business.id)

    // Step 9: Log event
    await supabase.from('lead_events').insert({
      business_id: business.id,
      event_type: 'production_enabled',
      metadata: {
        customer_id: customerId,
        customer_email: customerEmail,
        phone_number: elksNumber.number,
        vapi_phone: vapiPhoneNumber,
        activated_by: 'admin',
      },
    })

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
      },
      customer: {
        id: customerId,
        email: customerEmail,
      },
      phoneNumber: {
        id: phoneNumber.id,
        number: phoneNumber.phone_number,
        display: phoneNumber.phone_number_display,
        vapiNumber: vapiPhoneNumber,
      },
    })
  } catch (error) {
    console.error('Activate production error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
