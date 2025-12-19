import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendOutreachEmail } from '@/lib/email/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, to, subject } = body

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

    // Use custom recipient if provided, otherwise use business email
    const contactEmail = to || business.contact_email || business.email
    if (!contactEmail && !process.env.DEV_EMAIL_OVERRIDE) {
      return NextResponse.json(
        { error: 'No recipient email provided' },
        { status: 400 }
      )
    }

    // Dev mode: override recipient to test email (unless custom to is provided)
    const recipientEmail = process.env.DEV_EMAIL_OVERRIDE && !to ? process.env.DEV_EMAIL_OVERRIDE : contactEmail

    // Use custom subject if provided
    const emailSubject = subject || `${business.name} - Testa er AI-receptionist gratis`

    if (!business.preview_url || !business.vapi_assistant_id) {
      return NextResponse.json(
        { error: 'Business must have an agent created before sending email' },
        { status: 400 }
      )
    }

    // Generate tracking token if not exists
    let trackingToken = business.email_tracking_token
    if (!trackingToken) {
      trackingToken = crypto.randomUUID()
      await supabase
        .from('businesses')
        .update({ email_tracking_token: trackingToken })
        .eq('id', businessId)
    }

    // Send the email
    const result = await sendOutreachEmail({
      to: recipientEmail,
      businessName: business.name || 'Ert företag',
      previewUrl: business.preview_url,
      trackingToken,
      subject: emailSubject,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Update business status and timestamp
    await supabase
      .from('businesses')
      .update({
        status: 'email_sent',
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', businessId)

    // Log the event
    await supabase.from('lead_events').insert({
      business_id: businessId,
      event_type: 'email_sent',
      metadata: {
        message_id: result.messageId,
        to: recipientEmail,
        original_email: contactEmail,
        dev_override: !!process.env.DEV_EMAIL_OVERRIDE,
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: recipientEmail,
      originalEmail: contactEmail,
      devOverride: !!process.env.DEV_EMAIL_OVERRIDE,
    })
  } catch (error) {
    console.error('Send email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
