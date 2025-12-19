import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, contact_email } = body

    // Validate at least one email provided
    if (!email && !contact_email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    if (contact_email && !emailRegex.test(contact_email)) {
      return NextResponse.json(
        { error: 'Invalid contact email' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    const updates: any = {}
    if (email !== undefined) updates.email = email
    if (contact_email !== undefined) updates.contact_email = contact_email

    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Business update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
