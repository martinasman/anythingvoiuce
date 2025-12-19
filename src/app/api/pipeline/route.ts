import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { scrapeUrl } from '@/lib/firecrawl/client'
import { extractBusinessData } from '@/lib/claude/client'
import { createVapiAssistant } from '@/lib/vapi/client'
import { generateSystemPrompt } from '@/lib/vapi/prompts'
import { generateUniqueSlug } from '@/lib/utils/slug'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Step 1: Create pending business record
    const { data: business, error: createError } = await supabase
      .from('businesses')
      .insert({
        source_url: url,
        status: 'pending',
      })
      .select()
      .single()

    if (createError || !business) {
      console.error('Failed to create business record:', createError)
      return NextResponse.json(
        { error: 'Failed to create business record' },
        { status: 500 }
      )
    }

    const businessId = business.id

    try {
      // Step 2: Scrape website
      console.log(`[${businessId}] Scraping URL: ${url}`)
      const scrapeResult = await scrapeUrl(url)

      if (!scrapeResult.success || !scrapeResult.markdown) {
        await supabase.from('businesses').update({ status: 'pending' }).eq('id', businessId)
        return NextResponse.json(
          {
            error: 'Scraping failed',
            details: scrapeResult.error,
            businessId,
          },
          { status: 500 }
        )
      }

      // Step 3: Extract business data
      console.log(`[${businessId}] Extracting business data`)
      const businessData = await extractBusinessData(scrapeResult.markdown, url)

      if (!businessData) {
        return NextResponse.json(
          { error: 'Data extraction failed', businessId },
          { status: 500 }
        )
      }

      // Step 4: Generate unique slug
      console.log(`[${businessId}] Generating slug for: ${businessData.name}`)
      const slug = await generateUniqueSlug(businessData.name)

      // Step 5: Update business with extracted data
      await supabase
        .from('businesses')
        .update({
          name: businessData.name,
          slug,
          industry: businessData.industry,
          description: businessData.description,
          services: businessData.services,
          hours: businessData.hours || {},
          address: businessData.address,
          city: businessData.city,
          phone: businessData.phone,
          email: businessData.email,
          website: businessData.website,
          booking_url: businessData.booking_url,
          contact_name: businessData.contact_name,
          contact_email: businessData.contact_email,
          contact_phone: businessData.contact_phone,
          status: 'scraped',
        })
        .eq('id', businessId)

      // Log extraction event
      await supabase.from('lead_events').insert({
        business_id: businessId,
        event_type: 'data_extracted',
        metadata: {
          extraction_time_ms: Date.now() - startTime,
          services_count: businessData.services?.length ?? 0,
        },
      })

      // Step 6: Create Vapi assistant
      console.log(`[${businessId}] Creating Vapi assistant`)
      const vapiResult = await createVapiAssistant(businessData, slug)

      if (!vapiResult.success || !vapiResult.assistantId) {
        return NextResponse.json(
          {
            error: 'Agent creation failed',
            details: vapiResult.error,
            businessId,
            slug,
          },
          { status: 500 }
        )
      }

      // Step 7: Final update with agent info
      const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/demo/${slug}`
      const agentPrompt = generateSystemPrompt(businessData)

      await supabase
        .from('businesses')
        .update({
          vapi_assistant_id: vapiResult.assistantId,
          agent_prompt: agentPrompt,
          preview_url: previewUrl,
          status: 'agent_created',
        })
        .eq('id', businessId)

      // Log pipeline completion
      const totalTime = Date.now() - startTime
      await supabase.from('lead_events').insert({
        business_id: businessId,
        event_type: 'pipeline_completed',
        metadata: {
          total_time_ms: totalTime,
          vapi_assistant_id: vapiResult.assistantId,
        },
      })

      console.log(`[${businessId}] Pipeline completed in ${totalTime}ms`)

      return NextResponse.json({
        success: true,
        businessId,
        slug,
        previewUrl,
        assistantId: vapiResult.assistantId,
        processingTimeMs: totalTime,
        business: {
          name: businessData.name,
          industry: businessData.industry,
          city: businessData.city,
        },
      })
    } catch (error) {
      // Update status on error
      await supabase.from('businesses').update({ status: 'pending' }).eq('id', businessId)
      throw error
    }
  } catch (error) {
    console.error('Pipeline error:', error)
    return NextResponse.json(
      {
        error: 'Pipeline processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
