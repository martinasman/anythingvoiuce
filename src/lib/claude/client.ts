import { ExtractedBusinessDataSchema, type ExtractedBusinessData } from './schemas'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function callOpenRouter(prompt: string): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0].message.content
}

const EXTRACTION_PROMPT = `Du analyserar en svensk företagswebbplats. Extrahera följande information i JSON-format:

{
  "name": "Företagsnamnet",
  "industry": "En av: restaurant, salon, clinic, contractor, auto, realestate, other",
  "description": "En kort beskrivning av vad företaget gör (2-3 meningar på svenska)",
  "services": [
    { "name": "Tjänstnamn", "description": "Kort beskrivning", "price": "Pris om tillgängligt" }
  ],
  "hours": {
    "monday": "09:00-17:00",
    "tuesday": "09:00-17:00",
    ...
  },
  "address": "Fullständig gatuadress",
  "city": "Stad",
  "phone": "Telefonnummer",
  "email": "E-postadress",
  "website": "Webbplatsens URL",
  "booking_url": "URL för bokning om tillgänglig",
  "faqs": [
    { "question": "Vanlig fråga", "answer": "Svar baserat på innehållet" }
  ],
  "tone": "En av: professional, friendly, casual, formal (baserat på webbplatsens ton)",
  "language": "En av: swedish, english, both",
  "contact_name": "Kontaktpersonens namn om nämnt",
  "contact_email": "Direkt kontakt-email om annorlunda än allmän",
  "contact_phone": "Direkt kontaktnummer om annorlunda än allmänt"
}

Viktiga instruktioner:
- Svara ENDAST med giltig JSON
- Om information saknas, använd null för det fältet
- Generera 3-5 realistiska FAQs baserat på deras tjänster
- Beskriv tjänster kortfattat och tydligt
- Identifiera branschen baserat på tjänster och innehåll
- Alla beskrivningar ska vara på svenska`

export async function extractBusinessData(
  markdown: string,
  sourceUrl: string
): Promise<ExtractedBusinessData | null> {
  try {
    const prompt = `Webbplats-URL: ${sourceUrl}

Webbplatsinnehåll:
${markdown.slice(0, 15000)}

${EXTRACTION_PROMPT}`

    const responseText = await callOpenRouter(prompt)

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    } else {
      // Try to find raw JSON object
      const rawJsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (rawJsonMatch) {
        jsonText = rawJsonMatch[0]
      }
    }

    const parsed = JSON.parse(jsonText)
    const validated = ExtractedBusinessDataSchema.parse(parsed)

    return validated
  } catch (error) {
    console.error('Claude extraction error:', error)
    return null
  }
}
