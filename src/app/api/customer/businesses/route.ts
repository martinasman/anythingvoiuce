import { NextResponse } from 'next/server'
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

    const supabase = await createSupabaseServerClient()

    // Get businesses linked to this customer, or demo businesses without a customer
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, source_url, industry, status, vapi_assistant_id, is_production')
      .or(`customer_id.eq.${customer.id},customer_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching businesses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch businesses' },
        { status: 500 }
      )
    }

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('Businesses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
