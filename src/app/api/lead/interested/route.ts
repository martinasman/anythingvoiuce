import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notifySlackNewLead } from '@/lib/slack/webhook'

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

    // Fetch business
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

    // Update business status
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        status: 'interested',
        cta_clicked_at: new Date().toISOString(),
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update business' },
        { status: 500 }
      )
    }

    // Log event
    await supabase.from('lead_events').insert({
      business_id: businessId,
      event_type: 'cta_clicked',
      metadata: { timestamp: new Date().toISOString() },
    })

    // Send Slack notification (don't wait for it)
    notifySlackNewLead({
      businessName: business.name || 'Unknown',
      businessId: business.id,
      industry: business.industry,
      city: business.city,
      phone: business.phone,
      email: business.email,
      previewUrl: business.preview_url,
      callDuration: business.preview_call_duration_seconds,
    }).catch((error) => {
      console.error('Slack notification failed:', error)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead interested API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
