import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createVapiAssistant } from '@/lib/vapi/client'
import { generateSystemPrompt } from '@/lib/vapi/prompts'
import type { ExtractedBusinessData } from '@/lib/claude/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Fetch business data
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (fetchError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const biz = business as any

    if (!biz.name || !biz.slug) {
      return NextResponse.json(
        { error: 'Business must have name and slug before creating agent' },
        { status: 400 }
      )
    }

    // Prepare business data for Vapi
    const businessData: ExtractedBusinessData = {
      name: biz.name,
      industry: biz.industry,
      description: biz.description || '',
      services: biz.services || [],
      hours: biz.hours,
      address: biz.address,
      city: biz.city,
      phone: biz.phone,
      email: biz.email,
      website: biz.website,
      booking_url: biz.booking_url,
    }

    // Create Vapi assistant
    const result = await createVapiAssistant(businessData, biz.slug)

    if (!result.success || !result.assistantId) {
      return NextResponse.json(
        { error: result.error || 'Failed to create agent' },
        { status: 500 }
      )
    }

    // Generate preview URL and prompt
    const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/demo/${biz.slug}`
    const agentPrompt = generateSystemPrompt(businessData)

    // Update business with Vapi assistant ID
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        vapi_assistant_id: result.assistantId,
        agent_prompt: agentPrompt,
        preview_url: previewUrl,
        status: 'agent_created',
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update business record' },
        { status: 500 }
      )
    }

    // Log event
    await supabase.from('lead_events').insert({
      business_id: businessId,
      event_type: 'agent_created',
      metadata: { vapi_assistant_id: result.assistantId },
    })

    return NextResponse.json({
      success: true,
      assistantId: result.assistantId,
      previewUrl,
    })
  } catch (error) {
    console.error('Generate agent API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
