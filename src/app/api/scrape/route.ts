import { NextRequest, NextResponse } from 'next/server'
import { scrapeUrl } from '@/lib/firecrawl/client'

export async function POST(request: NextRequest) {
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

    const result = await scrapeUrl(url)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Scraping failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      markdown: result.markdown,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Scrape API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
