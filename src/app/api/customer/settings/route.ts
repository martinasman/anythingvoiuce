import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'

export async function GET() {
  try {
    const customer = await getCurrentCustomer()

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      whatsapp_phone: customer.whatsapp_phone,
      whatsapp_notifications_enabled: customer.whatsapp_notifications_enabled,
      email_notifications_enabled: customer.email_notifications_enabled,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer()

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      whatsapp_phone,
      whatsapp_notifications_enabled,
      email_notifications_enabled,
    } = body

    const supabase = await createSupabaseServerClient()

    const { error } = await supabase
      .from('customers')
      .update({
        whatsapp_phone,
        whatsapp_notifications_enabled,
        email_notifications_enabled,
      })
      .eq('id', customer.id)

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
