import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const customer = await getCurrentCustomer()

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Verify business belongs to customer
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('id, customer_id, vapi_assistant_id')
      .eq('id', id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    if (business.customer_id !== customer.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Update business with new prompt
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        custom_system_prompt: prompt,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating prompt:', updateError)
      return NextResponse.json(
        { error: 'Failed to update prompt' },
        { status: 500 }
      )
    }

    // TODO: Also update the Vapi assistant with the new prompt
    // This would require calling the Vapi API to update the assistant
    // For now, we just store it in our database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
