import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (token) {
    try {
      const supabase = await createSupabaseServerClient()

      // Find business by tracking token
      const { data: business } = await supabase
        .from('businesses')
        .select('id, email_opened_at')
        .eq('email_tracking_token', token)
        .single()

      if (business && !business.email_opened_at) {
        // Update email_opened_at only if not already set (first open)
        await supabase
          .from('businesses')
          .update({ email_opened_at: new Date().toISOString() })
          .eq('id', business.id)

        // Log the event
        await supabase.from('lead_events').insert({
          business_id: business.id,
          event_type: 'email_opened',
          metadata: {
            timestamp: new Date().toISOString(),
            user_agent: request.headers.get('user-agent') || 'unknown',
          },
        })
      }
    } catch (error) {
      // Silently fail - don't break the pixel
      console.error('Open tracking error:', error)
    }
  }

  // Always return the tracking pixel
  return new NextResponse(TRACKING_PIXEL, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
