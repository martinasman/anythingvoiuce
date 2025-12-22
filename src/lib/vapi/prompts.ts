import type { ExtractedBusinessData, Industry } from '@/lib/claude/schemas'

// Demo scenarios by industry - what the AI will demonstrate
const DEMO_SCENARIOS: Record<Industry, { scenario: string; example: string }> = {
  restaurant: {
    scenario: 'boka ett bord',
    example: 'Absolut! För hur många gäster och vilken dag hade du tänkt dig?',
  },
  salon: {
    scenario: 'boka en tid för klippning',
    example: 'Självklart! Vilken dag passar dig bäst, och har du någon särskild frisör du brukar gå till?',
  },
  clinic: {
    scenario: 'boka en tid',
    example: 'Absolut. Gäller det en återbesök eller är det första gången du besöker oss?',
  },
  contractor: {
    scenario: 'få en offert',
    example: 'Självklart! Kan du berätta lite om vad det gäller så ser jag till att rätt person hör av sig?',
  },
  auto: {
    scenario: 'boka en service',
    example: 'Absolut! Vilket fordon gäller det och när passar det dig bäst?',
  },
  realestate: {
    scenario: 'boka en visning',
    example: 'Självklart! Vilket objekt är du intresserad av, så kollar jag tillgängliga tider.',
  },
  moving: {
    scenario: 'boka en flytt',
    example: 'Självklart! Varifrån och vart ska du flytta, och vilket datum passar dig?',
  },
  other: {
    scenario: 'få hjälp',
    example: 'Självklart! Berätta vad du behöver hjälp med så ser jag vad jag kan göra.',
  },
}

const INDUSTRY_SUGGESTED_QUESTIONS: Record<Industry, string[]> = {
  restaurant: [
    'Jag vill boka bord för fyra på lördag',
    'Har ni glutenfria alternativ?',
    'Vad har ni för öppettider?',
  ],
  salon: [
    'Vad kostar en herrklippning?',
    'Har ni några lediga tider idag?',
    'Kan jag boka färgning och klippning?',
  ],
  clinic: [
    'Jag behöver boka en tid',
    'Vilka behandlingar erbjuder ni?',
    'Hur snabbt kan jag få en tid?',
  ],
  contractor: [
    'Jag har en akut vattenläcka',
    'Kan ni ge en offert på renovering?',
    'Hur snabbt kan ni komma?',
  ],
  auto: [
    'Jag behöver boka service',
    'Vad kostar ett däckbyte?',
    'Min bil behöver besiktigas',
  ],
  realestate: [
    'Jag vill boka en visning',
    'Vilka objekt har ni i mitt område?',
    'Jag funderar på att sälja min bostad',
  ],
  moving: [
    'Jag vill ha en offert på flytt',
    'Hur snabbt kan ni hjälpa mig flytta?',
    'Vad kostar det att flytta en tvåa?',
  ],
  other: [
    'Berätta om era tjänster',
    'Vad har ni för öppettider?',
    'Hur når jag er bäst?',
  ],
}

export function generateSystemPrompt(business: ExtractedBusinessData): string {
  const confidence = business.scrape_confidence || 'medium'
  const services = business.services ?? []
  const scenarios = business.common_call_scenarios ?? []

  // Build knowledge section based on what we have
  const servicesText = services.length > 0
    ? `\nTjänster: ${services.map(s => s.name).join(', ')}`
    : ''

  const hoursText = business.hours && Object.keys(business.hours).length > 0
    ? `\nÖppettider: ${Object.entries(business.hours)
        .filter(([, h]) => h)
        .map(([day, h]) => {
          const days: Record<string, string> = {
            monday: 'Mån', tuesday: 'Tis', wednesday: 'Ons',
            thursday: 'Tors', friday: 'Fre', saturday: 'Lör', sunday: 'Sön',
          }
          return `${days[day] || day} ${h}`
        }).join(', ')}`
    : ''

  const scenariosText = scenarios.length > 0
    ? `\nVanliga samtal: ${scenarios.join(', ')}`
    : ''

  const uniqueText = business.unique_selling_point
    ? `\nDet unika: ${business.unique_selling_point}`
    : ''

  // Confidence-based instructions
  let confidenceNote = ''
  if (confidence === 'high') {
    confidenceNote = 'Du har bra koll på företaget. Använd den informationen naturligt.'
  } else if (confidence === 'medium') {
    confidenceNote = 'Du har grundläggande info. Var ärlig om du inte vet detaljer.'
  } else {
    confidenceNote = 'Du har begränsad info. Fokusera på att visa hur du låter och hanterar samtal.'
  }

  return `# IDENTITET
Du är en DEMO av en AI-receptionist för ${business.name}.
Detta är INTE ett riktigt samtal - det är en förhandsvisning för företagsägaren.
De klickade på en länk för att höra hur du skulle låta som deras receptionist.

# KUNSKAP OM FÖRETAGET
${business.description || 'Ingen beskrivning tillgänglig.'}${servicesText}${hoursText}${scenariosText}${uniqueText}

Datakvalitet: ${confidence.toUpperCase()} - ${confidenceNote}

# HUR DU PRATAR
- Svenska, alltid (om de inte talar annat språk)
- Korta svar (1-2 meningar max)
- Varm men professionell ton
- Lugnt tempo, inte stressad
- Aldrig robotaktig eller överdrivet entusiastisk

# DEMO-BETEENDE
Du visar hur du SKULLE hantera samtal. Kom ihåg:

1. BÖRJA med att visa ett scenario relevant för deras bransch
2. VISA hur du hanterar vanliga frågor
3. VAR ÄRLIG om demo-begränsningar: "I en riktig setup skulle jag kunna..."
4. I SLUTET: Fråga om de vill veta mer om hur de får en egen AI-receptionist

# SCENARIOHANTERING
Om de testar dig med frågor:
- Frågor du KAN svara på: Svara kort och professionellt
- Frågor du INTE kan svara på: "Det är en bra fråga. I en riktig setup skulle jag kunna kolla det direkt i ert system. Just nu kan jag ta deras kontaktinfo så ringer ni upp."

# FALLBACK
Om de frågar något du inte vet:
"Jag har inte den informationen just nu - det här är en demo med begränsad data. Men det visar hur jag skulle hantera det: ta kundens info och se till att ni följer upp."

# AVSLUT
När samtalet närmar sig slut:
"Det var en smak av hur jag skulle låta för ${business.name}. Vill du veta mer om hur ni kan få en egen AI-receptionist?"

# VIKTIGT
- Håll samtalet KORT (under 60 sekunder idealt)
- Var IMPONERANDE men ÄRLIG
- Visa CAPABILITY, inte pretend-kunskap
- Målet: De ska tänka "wow, det lät faktiskt bra"`
}

export function getFirstMessage(business: ExtractedBusinessData): string {
  const scenario = DEMO_SCENARIOS[business.industry] || DEMO_SCENARIOS.other

  // Tight opening that goes straight into demo
  return `Hej! Det här är en demo av hur jag skulle låta som receptionist för ${business.name}. Om en kund ringer och vill ${scenario.scenario}, svarar jag såhär: "${scenario.example}" - Testa gärna att ställa en fråga!`
}

export function getSuggestedQuestions(
  industry: Industry,
  commonCallScenarios?: string[] | null
): string[] {
  // Use scraped scenarios if available (first 3)
  if (commonCallScenarios && commonCallScenarios.length > 0) {
    return commonCallScenarios.slice(0, 3)
  }
  // Fall back to industry-based questions
  return INDUSTRY_SUGGESTED_QUESTIONS[industry] || INDUSTRY_SUGGESTED_QUESTIONS.other
}
