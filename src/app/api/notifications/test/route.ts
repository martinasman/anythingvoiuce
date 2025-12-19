import { NextRequest, NextResponse } from 'next/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import { sendTextMessage, isWhatsAppConfigured } from '@/lib/whatsapp/client'

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer()

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, phone } = body

    if (type === 'whatsapp') {
      if (!isWhatsAppConfigured()) {
        return NextResponse.json(
          { error: 'WhatsApp is not configured' },
          { status: 503 }
        )
      }

      if (!phone) {
        return NextResponse.json(
          { error: 'Phone number is required' },
          { status: 400 }
        )
      }

      const result = await sendTextMessage(
        phone,
        `🔔 Testmeddelande från AnythingVoice!\n\nDetta är ett testmeddelande för att verifiera att dina WhatsApp-notifieringar fungerar.\n\nNär du får samtal kommer du att få en sammanfattning här.`
      )

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send test message' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    if (type === 'email') {
      // TODO: Implement email test
      return NextResponse.json(
        { error: 'Email notifications not implemented yet' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid notification type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Notification test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
