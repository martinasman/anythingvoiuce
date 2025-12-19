import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Default redirect if something goes wrong
  let redirectUrl = baseUrl

  if (token) {
    try {
      const supabase = await createSupabaseServerClient()

      // Find business by tracking token
      const { data: business } = await supabase
        .from('businesses')
        .select('id, slug, preview_url')
        .eq('email_tracking_token', token)
        .single()

      if (business) {
        // Set redirect to the actual demo URL
        redirectUrl = business.preview_url || `${baseUrl}/demo/${business.slug}`

        // Log the click event
        await supabase.from('lead_events').insert({
          business_id: business.id,
          event_type: 'email_link_clicked',
          metadata: {
            timestamp: new Date().toISOString(),
            user_agent: request.headers.get('user-agent') || 'unknown',
            referer: request.headers.get('referer') || 'unknown',
          },
        })

        // Update preview_viewed_at if clicking through email
        await supabase
          .from('businesses')
          .update({
            preview_viewed_at: new Date().toISOString(),
          })
          .eq('id', business.id)
      }
    } catch (error) {
      console.error('Click tracking error:', error)
    }
  }

  // Redirect to the demo page
  return NextResponse.redirect(redirectUrl)
}
