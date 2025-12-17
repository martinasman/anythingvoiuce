import Firecrawl from '@mendable/firecrawl-js'

let firecrawl: Firecrawl | null = null

function getFirecrawlClient(): Firecrawl {
  if (!firecrawl) {
    firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    })
  }
  return firecrawl
}

export interface ScrapeResult {
  success: boolean
  markdown?: string
  metadata?: {
    title?: string
    description?: string
    language?: string
    sourceURL?: string
  }
  error?: string
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const client = getFirecrawlClient()
    const response = await client.scrape(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    })

    // Response is the document directly
    if (response && response.markdown) {
      return {
        success: true,
        markdown: response.markdown,
        metadata: {
          title: response.metadata?.title,
          description: response.metadata?.description,
          language: response.metadata?.language,
          sourceURL: response.metadata?.sourceURL,
        },
      }
    }

    return {
      success: false,
      error: 'Failed to extract markdown content from URL',
    }
  } catch (error) {
    console.error('Firecrawl scrape error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown scraping error',
    }
  }
}
