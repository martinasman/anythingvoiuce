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

const EXTRACTION_PROMPT = `Du analyserar en svensk företagswebbplats för att bygga en AI-receptionist demo. Extrahera följande information i JSON-format:

{
  "name": "Företagsnamnet",
  "industry": "En av: restaurant, salon, clinic, contractor, auto, realestate, moving, other",
  "description": "En kort beskrivning av vad företaget gör (2-3 meningar på svenska)",
  "services": [
    { "name": "Tjänstnamn", "description": "Kort beskrivning", "price": "Pris om tillgängligt" }
  ],
  "hours": {
    "monday": "09:00-17:00",
    "tuesday": "09:00-17:00"
  },
  "address": "Fullständig gatuadress",
  "city": "Stad",
  "phone": "Telefonnummer",
  "email": "Huvudsaklig kontakt-email",
  "website": "Webbplatsens URL",
  "booking_url": "URL för bokning om tillgänglig",
  "faqs": [
    { "question": "Vanlig fråga", "answer": "Svar baserat på innehållet" }
  ],
  "tone": "En av: professional, friendly, casual, formal",
  "language": "En av: swedish, english, both",
  "contact_name": "Kontaktpersonens namn (ägare, VD, chef)",
  "contact_email": "Direkt email till beslutsfattare",
  "contact_phone": "Direkt kontaktnummer",
  "team_size": "En av: solo (1 person), small (2-5), medium (6-20), large (21+)",
  "staff_names": ["Lista med namn på personal om synliga på webbplatsen"],
  "common_call_scenarios": [
    "Vanliga anledningar till att kunder ringer (baserat på deras tjänster)"
  ],
  "booking_method": "En av: phone, online, both, unknown",
  "urgency_handling": true/false om de hanterar akutärenden,
  "unique_selling_point": "Vad som gör dem speciella (från webbplatsen)",
  "scrape_confidence": "En av: high (mycket data), medium (grundläggande info), low (minimal data)"
}

VIKTIGA INSTRUKTIONER:

1. Svara ENDAST med giltig JSON, inga förklaringar

2. common_call_scenarios - Tänk som en kund:
   - Restaurant: "Boka bord", "Fråga om allergier", "Avboka bokning"
   - Salon: "Boka klippning", "Fråga om pris", "Ändra tid"
   - Clinic: "Boka tid", "Akut fråga", "Recept"
   - Contractor: "Begära offert", "Akut läcka", "Fråga om tillgänglighet"
   - Auto: "Boka service", "Däckbyte", "Besiktning"
   - Realestate: "Boka visning", "Fråga om objekt", "Sälja bostad"
   - Moving: "Begära offert", "Boka flytt", "Fråga om pris"

3. team_size - Gör en kvalificerad gissning:
   - Enmansföretag utan personal = "solo"
   - Liten firma med några anställda = "small"
   - Tydligt medium företag = "medium"
   - Stort företag = "large"

4. scrape_confidence:
   - "high": Tjänster, priser, öppettider, kontaktinfo finns
   - "medium": Grundläggande info finns men inte allt
   - "low": Bara namn och viss beskrivning

5. Email-prioritering:
   - Leta i sidfot, "Kontakta oss", "Om oss", mailto: länkar
   - Prioritera: 1) Ägarens email 2) info@/kontakt@ 3) Annan email
   - contact_email = beslutsfattarens email om möjligt

6. Generera 3-5 realistiska FAQs baserat på deras tjänster

7. Alla beskrivningar på svenska`

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
