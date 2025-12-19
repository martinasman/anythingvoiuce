import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * POST /api/business/[id]/activate-production
 *
 * Convert a demo business to a production customer using pre-allocated numbers:
 * 1. Create customer record (if not exists)
 * 2. Use existing Vapi US number from env (VAPI_PHONE_NUMBER)
 * 3. Use existing 46elks number from env (or first available in database)
 * 4. Link phone numbers to customer
 * 5. Update business as production
 *
 * For development: One set of numbers shared across test customers
 * For production: Each customer gets their own allocated numbers
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
          telegram_chat_id: telegramChatId || null,
          telegram_notifications_enabled: !!telegramChatId,
          whatsapp_notifications_enabled: !!whatsappPhone,
        })
        .eq('id', customerId)
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: customerEmail,
          name: customerName || null,
          company_name: business.name || null,
          whatsapp_phone: whatsappPhone || null,
          telegram_chat_id: telegramChatId || null,
          telegram_notifications_enabled: !!telegramChatId,
          whatsapp_notifications_enabled: !!whatsappPhone,
          subscription_status: 'trial',
        })
        .select()
        .single()

      if (customerError || !newCustomer) {
        console.error('Failed to create customer:', customerError)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Step 3: Get pre-allocated Vapi number from environment
    const vapiPhoneNumber = process.env.VAPI_PHONE_NUMBER
    const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID

    if (!vapiPhoneNumber || !vapiPhoneNumberId) {
      return NextResponse.json(
        {
          error: 'Vapi phone number not configured. Set VAPI_PHONE_NUMBER and VAPI_PHONE_NUMBER_ID in environment variables.',
        },
        { status: 500 }
      )
    }

    // Step 4: Get pre-allocated 46elks number from environment or database
    // First, check if there's a dev/test number in env
    const devElksNumber = process.env.DEV_ELKS_PHONE_NUMBER // e.g., +46850924581
    const devElksNumberId = process.env.DEV_ELKS_PHONE_NUMBER_ID

    let elksNumber: string
    let elksNumberId: string
    let elksNumberDisplay: string

    if (devElksNumber && devElksNumberId) {
      // Use dev number from env
      elksNumber = devElksNumber
      elksNumberId = devElksNumberId
      elksNumberDisplay = formatSwedishNumber(devElksNumber)
    } else {
      // Check if there's already a shared dev number in database
      const { data: sharedNumber } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (sharedNumber) {
        elksNumber = sharedNumber.phone_number
        elksNumberId = sharedNumber.provider_number_id || ''
        elksNumberDisplay = sharedNumber.phone_number_display || formatSwedishNumber(elksNumber)
      } else {
        return NextResponse.json(
          {
            error: 'No phone numbers available. Please allocate a 46elks number manually and add to database, or set DEV_ELKS_PHONE_NUMBER in environment.',
          },
          { status: 500 }
        )
      }
    }

    // Step 5: Check if this customer already has a phone number record
    const { data: existingPhone } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('customer_id', customerId)
      .single()

    let phoneNumberId: string

    if (existingPhone) {
      // Update existing phone number record to point to this business
      const { data: updatedPhone, error: updateError } = await supabase
        .from('phone_numbers')
        .update({
          business_id: business.id,
          phone_number: elksNumber,
          phone_number_display: elksNumberDisplay,
          provider_number_id: elksNumberId,
          vapi_phone_number: vapiPhoneNumber,
          vapi_phone_number_id: vapiPhoneNumberId,
          status: 'active',
          activated_at: new Date().toISOString(),
        })
        .eq('id', existingPhone.id)
        .select()
        .single()

      if (updateError || !updatedPhone) {
        console.error('Failed to update phone number:', updateError)
        return NextResponse.json(
          { error: 'Failed to update phone number' },
          { status: 500 }
        )
      }

      phoneNumberId = updatedPhone.id
    } else {
      // First, unlink the shared number from any other businesses (for dev/testing)
      await supabase
        .from('phone_numbers')
        .update({ business_id: null })
        .eq('phone_number', elksNumber)

      // Create new phone number record
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/46elks`

      const { data: newPhone, error: phoneError } = await supabase
        .from('phone_numbers')
        .insert({
          customer_id: customerId,
          business_id: business.id,
          phone_number: elksNumber,
          phone_number_display: elksNumberDisplay,
          country_code: 'SE',
          provider: '46elks',
          provider_number_id: elksNumberId,
          provider_config: { voice_start: webhookUrl },
          status: 'active',
          activated_at: new Date().toISOString(),
          monthly_cost_cents: 300,
          vapi_phone_number: vapiPhoneNumber,
          vapi_phone_number_id: vapiPhoneNumberId,
        })
        .select()
        .single()

      if (phoneError || !newPhone) {
        console.error('Failed to create phone number:', phoneError)
        return NextResponse.json(
          { error: 'Failed to create phone number record' },
          { status: 500 }
        )
      }

      phoneNumberId = newPhone.id
    }

    // Step 6: Update business as production
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        customer_id: customerId,
        is_production: true,
        production_enabled_at: new Date().toISOString(),
        voice_id: voiceId || null,
      })
      .eq('id', business.id)

    if (updateError) {
      console.error('Failed to update business:', updateError)
      return NextResponse.json(
        { error: 'Failed to update business' },
        { status: 500 }
      )
    }

    // Success!
    return NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        email: customerEmail,
        name: customerName,
      },
      phoneNumber: {
        id: phoneNumberId,
        number: elksNumber,
        display: elksNumberDisplay,
        vapiNumber: vapiPhoneNumber,
      },
      message: `Production activated! Calls to ${elksNumberDisplay} will be handled by the AI assistant.`,
      devMode: true,
      devModeNote: 'Using shared dev numbers. In production, each customer will get unique numbers.',
    })
  } catch (error) {
    console.error('Error activating production:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Format Swedish phone number for display
 * +46701234567 -> 070-123 45 67
 */
function formatSwedishNumber(e164: string): string {
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

  // 08 numbers (Stockholm landline - 8 digits after 08)
  if (nationalNumber.startsWith('8')) {
    const match = nationalNumber.match(/^(8)(\d{3})(\d{2})(\d{2})$/)
    if (match) {
      return `0${match[1]}-${match[2]} ${match[3]} ${match[4]}`
    }
  }

  // Landline numbers (various lengths)
  return '0' + nationalNumber.replace(/(\d{2,3})(\d{3})(\d{2})(\d{2})?/, '$1-$2 $3 $4').trim()
}
