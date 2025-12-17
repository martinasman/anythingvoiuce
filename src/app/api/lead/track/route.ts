import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, eventType, metadata = {} } = body

    if (!businessId || !eventType) {
      return NextResponse.json(
        { error: 'Business ID and event type are required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Log event
    await supabase.from('lead_events').insert({
      business_id: businessId,
      event_type: eventType,
      metadata: { ...metadata, timestamp: new Date().toISOString() },
    })

    // Update business timestamps based on event type
    if (eventType === 'call_started') {
      await supabase
        .from('businesses')
        .update({ preview_call_started_at: new Date().toISOString() })
        .eq('id', businessId)
    }

    if (eventType === 'call_ended' && metadata.duration) {
      await supabase
        .from('businesses')
        .update({ preview_call_duration_seconds: metadata.duration })
        .eq('id', businessId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead track API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
