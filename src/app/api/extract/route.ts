import { NextRequest, NextResponse } from 'next/server'
import { extractBusinessData } from '@/lib/claude/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { markdown, sourceUrl } = body

    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      )
    }

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return NextResponse.json(
        { error: 'Source URL is required' },
        { status: 400 }
      )
    }

    const businessData = await extractBusinessData(markdown, sourceUrl)

    if (!businessData) {
      return NextResponse.json(
        { error: 'Failed to extract business data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: businessData,
    })
  } catch (error) {
    console.error('Extract API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
