import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendOutreachEmail } from '@/lib/email/client'

interface BatchResult {
  businessId: string
  businessName: string
  success: boolean
  error?: string
  messageId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessIds } = body

    if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return NextResponse.json(
        { error: 'businessIds array is required' },
        { status: 400 }
      )
    }

    // Limit batch size
    if (businessIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 emails per batch' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const results: BatchResult[] = []
    let successCount = 0
    let failureCount = 0

    for (const businessId of businessIds) {
      // Fetch business
      const { data: business, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (fetchError || !business) {
        results.push({
          businessId,
          businessName: 'Unknown',
          success: false,
          error: 'Business not found',
        })
        failureCount++
        continue
      }

      const contactEmail = business.contact_email || business.email
      if (!contactEmail && !process.env.DEV_EMAIL_OVERRIDE) {
        results.push({
          businessId,
          businessName: business.name || 'Unknown',
          success: false,
          error: 'No contact email',
        })
        failureCount++
        continue
      }

      // Dev mode: override recipient to test email
      const recipientEmail = process.env.DEV_EMAIL_OVERRIDE || contactEmail

      if (!business.preview_url || !business.vapi_assistant_id) {
        results.push({
          businessId,
          businessName: business.name || 'Unknown',
          success: false,
          error: 'Agent not created',
        })
        failureCount++
        continue
      }

      // Generate tracking token if needed
      let trackingToken = business.email_tracking_token
      if (!trackingToken) {
        trackingToken = crypto.randomUUID()
        await supabase
          .from('businesses')
          .update({ email_tracking_token: trackingToken })
          .eq('id', businessId)
      }

      // Small delay between emails to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Send email
      const result = await sendOutreachEmail({
        to: recipientEmail,
        businessName: business.name || 'Ert företag',
        previewUrl: business.preview_url,
        trackingToken,
      })

      if (result.success) {
        // Update business
        await supabase
          .from('businesses')
          .update({
            status: 'email_sent',
            email_sent_at: new Date().toISOString(),
          })
          .eq('id', businessId)

        // Log event
        await supabase.from('lead_events').insert({
          business_id: businessId,
          event_type: 'email_sent',
          metadata: {
            message_id: result.messageId,
            to: recipientEmail,
            original_email: contactEmail,
            dev_override: !!process.env.DEV_EMAIL_OVERRIDE,
            batch: true,
          },
        })

        results.push({
          businessId,
          businessName: business.name || 'Unknown',
          success: true,
          messageId: result.messageId,
        })
        successCount++
      } else {
        results.push({
          businessId,
          businessName: business.name || 'Unknown',
          success: false,
          error: result.error,
        })
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      total: businessIds.length,
      successCount,
      failureCount,
      results,
    })
  } catch (error) {
    console.error('Batch email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
