import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: voices, error } = await supabase
      .from('voice_options')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Error fetching voices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: 500 }
      )
    }

    return NextResponse.json({ voices })
  } catch (error) {
    console.error('Voices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
