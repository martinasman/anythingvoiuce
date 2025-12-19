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

    // Step 5: Check if the shared phone number already exists in database
    // This is the dev number that gets reused across test customers
    const { data: existingSharedNumber } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('phone_number', elksNumber)
      .single()

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/46elks`
    let phoneNumberId: string

    if (existingSharedNumber) {
      // Phone number already exists - update it to point to this customer and business
      console.log('Reusing existing shared phone number:', elksNumber)

      const { data: updatedPhone, error: updateError } = await supabase
        .from('phone_numbers')
        .update({
          customer_id: customerId,
          business_id: business.id,
          phone_number_display: elksNumberDisplay,
          provider_number_id: elksNumberId,
          vapi_phone_number: vapiPhoneNumber,
          vapi_phone_number_id: vapiPhoneNumberId,
          status: 'active',
          activated_at: new Date().toISOString(),
        })
        .eq('id', existingSharedNumber.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update phone number:', updateError)
        return NextResponse.json(
          {
            error: 'Failed to update phone number record',
            details: updateError.message
          },
          { status: 500 }
        )
      }

      phoneNumberId = updatedPhone.id
    } else {
      // Phone number doesn't exist yet - create it
      // This should only happen the very first time activating dev mode
      console.log('Creating new shared phone number record:', elksNumber)

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

      if (phoneError) {
        console.error('Failed to create phone number:', phoneError)
        return NextResponse.json(
          {
            error: 'Failed to create phone number record',
            details: phoneError.message,
            hint: 'The phone number might already exist or there may be a database constraint issue.'
          },
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

    // Step 7: Update Vapi phone number to use this business's assistant
    // This ensures the shared dev number answers with the correct assistant
    const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY
    let vapiAssistantUpdated = false

    if (vapiPrivateKey && vapiPhoneNumberId && business.vapi_assistant_id) {
      try {
        console.log('[Vapi] Updating phone number assistant to:', business.vapi_assistant_id)

        const vapiResponse = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneNumberId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${vapiPrivateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantId: business.vapi_assistant_id
          })
        })

        if (vapiResponse.ok) {
          console.log('[Vapi] Successfully updated phone number assistant')
          vapiAssistantUpdated = true
        } else {
          const errorText = await vapiResponse.text()
          console.error('[Vapi] Failed to update assistant:', errorText)
        }
      } catch (error) {
        console.error('[Vapi] Error updating phone number:', error)
        // Don't fail the whole request - the database is updated correctly
        // and webhook routing will still work as a fallback
      }
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
      assistant: {
        id: business.vapi_assistant_id,
        name: business.name,
        updated: vapiAssistantUpdated,
      },
      message: `Production activated! Calls to ${elksNumberDisplay} will be handled by ${business.name}'s AI assistant.`,
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
