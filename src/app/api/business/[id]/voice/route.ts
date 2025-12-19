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
    const { voiceId } = body

    if (!voiceId || typeof voiceId !== 'string') {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      )
    }

    // Verify voice exists
    const { data: voice, error: voiceError } = await supabase
      .from('voice_options')
      .select('id, voice_id')
      .eq('voice_id', voiceId)
      .eq('is_active', true)
      .single()

    if (voiceError || !voice) {
      return NextResponse.json(
        { error: 'Voice not found' },
        { status: 404 }
      )
    }

    // Update business with new voice
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        voice_id: voiceId,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating voice:', updateError)
      return NextResponse.json(
        { error: 'Failed to update voice' },
        { status: 500 }
      )
    }

    // TODO: Also update the Vapi assistant with the new voice
    // This would require calling the Vapi API to update the assistant

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating voice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
