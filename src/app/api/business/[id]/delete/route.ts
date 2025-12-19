import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    // Get the business first to check if it's a production customer
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, vapi_assistant_id, is_production')
      .eq('id', id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Don't allow deleting production customers
    if (business.is_production) {
      return NextResponse.json(
        { error: 'Cannot delete a production customer. Deactivate them first.' },
        { status: 400 }
      )
    }

    // Delete Vapi assistant if exists
    if (business.vapi_assistant_id) {
      const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY
      if (vapiPrivateKey) {
        try {
          const vapiResponse = await fetch(
            `https://api.vapi.ai/assistant/${business.vapi_assistant_id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${vapiPrivateKey}`,
              },
            }
          )

          if (!vapiResponse.ok) {
            console.warn('[Delete] Failed to delete Vapi assistant:', await vapiResponse.text())
          } else {
            console.log('[Delete] Vapi assistant deleted:', business.vapi_assistant_id)
          }
        } catch (vapiError) {
          console.error('[Delete] Vapi API error:', vapiError)
          // Continue with deletion even if Vapi fails
        }
      }
    }

    // Delete lead events first (foreign key constraint)
    await supabase
      .from('lead_events')
      .delete()
      .eq('business_id', id)

    // Delete the business
    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[Delete] Database error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete business' },
        { status: 500 }
      )
    }

    console.log('[Delete] Business deleted:', business.name)

    return NextResponse.json({
      success: true,
      message: `${business.name} has been deleted`,
    })
  } catch (error) {
    console.error('[Delete] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
