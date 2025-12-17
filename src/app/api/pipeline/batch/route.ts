import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { scrapeUrl } from '@/lib/firecrawl/client'
import { extractBusinessData } from '@/lib/claude/client'
import { createVapiAssistant } from '@/lib/vapi/client'
import { generateSystemPrompt } from '@/lib/vapi/prompts'
import { generateUniqueSlug } from '@/lib/utils/slug'
import { withRetry, sleep } from '@/lib/utils/retry'
import { notifySlackPipelineComplete } from '@/lib/slack/webhook'

interface BatchResult {
  url: string
  success: boolean
  businessId?: string
  slug?: string
  previewUrl?: string
  error?: string
  processingTimeMs?: number
}

// Configuration
const CONCURRENT_LIMIT = 5 // Process 5 URLs at a time
const DELAY_BETWEEN_BATCHES_MS = 2000 // 2 second delay between batches
const MAX_URLS_PER_REQUEST = 1000

async function processUrl(url: string): Promise<BatchResult> {
  const startTime = Date.now()

  try {
    // Validate URL
    try {
      new URL(url)
    } catch {
      return { url, success: false, error: 'Invalid URL format' }
    }

    const supabase = await createSupabaseServerClient()

    // Create pending record
    const { data: business, error: createError } = await supabase
      .from('businesses')
      .insert({ source_url: url, status: 'pending' })
      .select()
      .single()

    if (createError || !business) {
      return { url, success: false, error: 'Failed to create record' }
    }

    const businessId = business.id

    try {
      // Scrape with retry
      const scrapeResult = await withRetry(
        () => scrapeUrl(url),
        {
          maxAttempts: 2,
          baseDelayMs: 2000,
          shouldRetry: (error) => {
            // Retry on rate limits or network errors
            const msg = String(error)
            return msg.includes('429') || msg.includes('timeout') || msg.includes('ECONNRESET')
          },
        }
      )

      if (!scrapeResult.success || !scrapeResult.markdown) {
        return {
          url,
          success: false,
          businessId,
          error: scrapeResult.error || 'Scraping failed',
        }
      }

      // Extract data
      const businessData = await extractBusinessData(scrapeResult.markdown, url)
      if (!businessData) {
        return {
          url,
          success: false,
          businessId,
          error: 'Data extraction failed',
        }
      }

      // Generate slug
      const slug = await generateUniqueSlug(businessData.name)

      // Update with extracted data
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

      // Create Vapi assistant
      const vapiResult = await createVapiAssistant(businessData, slug)
      if (!vapiResult.success || !vapiResult.assistantId) {
        return {
          url,
          success: false,
          businessId,
          slug,
          error: vapiResult.error || 'Agent creation failed',
        }
      }

      // Final update
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

      // Log event
      await supabase.from('lead_events').insert({
        business_id: businessId,
        event_type: 'pipeline_completed',
        metadata: {
          batch: true,
          processing_time_ms: Date.now() - startTime,
        },
      })

      return {
        url,
        success: true,
        businessId,
        slug,
        previewUrl,
        processingTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      // Update status on error
      await supabase.from('businesses').update({ status: 'pending' }).eq('id', businessId)
      return {
        url,
        success: false,
        businessId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  } catch (error) {
    return {
      url,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { urls, notifyOnComplete = false } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    // Filter and limit URLs
    const urlsToProcess = urls
      .filter((url: unknown) => typeof url === 'string' && url.trim().length > 0)
      .map((url: string) => url.trim())
      .slice(0, MAX_URLS_PER_REQUEST)

    if (urlsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      )
    }

    const results: BatchResult[] = []

    // Process in batches
    for (let i = 0; i < urlsToProcess.length; i += CONCURRENT_LIMIT) {
      const batch = urlsToProcess.slice(i, i + CONCURRENT_LIMIT)
      const batchNumber = Math.floor(i / CONCURRENT_LIMIT) + 1
      const totalBatches = Math.ceil(urlsToProcess.length / CONCURRENT_LIMIT)

      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} URLs)`)

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map((url) => processUrl(url))
      )

      results.push(...batchResults)

      // Delay between batches to respect rate limits
      if (i + CONCURRENT_LIMIT < urlsToProcess.length) {
        await sleep(DELAY_BETWEEN_BATCHES_MS)
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length
    const totalTime = Date.now() - startTime

    // Send Slack notification if requested
    if (notifyOnComplete) {
      await notifySlackPipelineComplete(results.length, successCount, failureCount)
    }

    console.log(`Batch complete: ${successCount}/${results.length} succeeded in ${totalTime}ms`)

    return NextResponse.json({
      success: true,
      totalProcessed: results.length,
      successCount,
      failureCount,
      processingTimeMs: totalTime,
      results,
    })
  } catch (error) {
    console.error('Batch pipeline error:', error)
    return NextResponse.json(
      {
        error: 'Batch processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
