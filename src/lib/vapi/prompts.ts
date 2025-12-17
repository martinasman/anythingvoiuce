import type { ExtractedBusinessData, Industry } from '@/lib/claude/schemas'

const INDUSTRY_INTROS: Record<Industry, string> = {
  restaurant: 'Hej och välkommen till {name}! Jag är er AI-receptionist och kan hjälpa dig med bordsbokningar, information om vår meny och öppettider.',
  salon: 'Hej och välkommen till {name}! Jag kan hjälpa dig boka tid för behandlingar och berätta om våra tjänster och priser.',
  clinic: 'Välkommen till {name}. Jag är här för att hjälpa dig boka tid eller svara på frågor om våra tjänster och behandlingar.',
  contractor: 'Hej! Du har nått {name}. Jag kan hjälpa dig med offertförfrågningar och information om våra tjänster.',
  auto: 'Välkommen till {name}! Jag kan hjälpa dig boka service, däckbyten eller svara på frågor om våra tjänster.',
  realestate: 'Hej och välkommen till {name}! Jag kan hjälpa dig med visningar och information om våra objekt.',
  other: 'Hej och välkommen till {name}! Hur kan jag hjälpa dig idag?',
}

const INDUSTRY_SUGGESTED_QUESTIONS: Record<Industry, string[]> = {
  restaurant: [
    'Kan jag boka ett bord för fyra på lördag?',
    'Vilka allergier kan ni anpassa för?',
    'Har ni några vegetariska alternativ?',
  ],
  salon: [
    'Vad kostar en klippning?',
    'Har ni drop-in tider idag?',
    'Kan jag boka en färgning?',
  ],
  clinic: [
    'Hur bokar jag en tid?',
    'Vilka behandlingar erbjuder ni?',
    'Tar ni emot nya patienter?',
  ],
  contractor: [
    'Kan ni komma på en akut läcka?',
    'Vad kostar en besiktning?',
    'Hur snabbt kan ni ge en offert?',
  ],
  auto: [
    'Vad kostar en service?',
    'Kan jag boka däckbyte?',
    'Har ni drop-in för besiktning?',
  ],
  realestate: [
    'Vilka objekt har ni till salu just nu?',
    'Kan jag boka en visning?',
    'Hur fungerar budgivningen?',
  ],
  other: [
    'Vilka tjänster erbjuder ni?',
    'Vad är era öppettider?',
    'Hur når jag er bäst?',
  ],
}

export function generateSystemPrompt(business: ExtractedBusinessData): string {
  const servicesText = business.services.length > 0
    ? `\n\n## Tjänster vi erbjuder:\n${business.services.map(s =>
        `- ${s.name}${s.price ? ` (${s.price})` : ''}${s.description ? `: ${s.description}` : ''}`
      ).join('\n')}`
    : ''

  const hoursText = business.hours && Object.keys(business.hours).length > 0
    ? `\n\n## Öppettider:\n${Object.entries(business.hours)
        .filter(([, hours]) => hours)
        .map(([day, hours]) => {
          const dayNames: Record<string, string> = {
            monday: 'Måndag',
            tuesday: 'Tisdag',
            wednesday: 'Onsdag',
            thursday: 'Torsdag',
            friday: 'Fredag',
            saturday: 'Lördag',
            sunday: 'Söndag',
          }
          return `- ${dayNames[day] || day}: ${hours}`
        }).join('\n')}`
    : ''

  const addressText = business.address
    ? `\n\n## Adress:\n${business.address}${business.city ? `, ${business.city}` : ''}`
    : ''

  const faqsText = business.faqs && business.faqs.length > 0
    ? `\n\n## Vanliga frågor och svar:\n${business.faqs.map(faq =>
        `F: ${faq.question}\nS: ${faq.answer}`
      ).join('\n\n')}`
    : ''

  const bookingText = business.booking_url
    ? `\n\n## Bokning:\nKunder kan boka online på: ${business.booking_url}`
    : ''

  return `Du är en AI-receptionist för ${business.name}.

## Om företaget:
${business.description}
${servicesText}
${hoursText}
${addressText}
${bookingText}
${faqsText}

## Dina instruktioner:
- Svara ALLTID på svenska om inte kunden tydligt talar ett annat språk
- Håll svaren korta och koncisa (max 2-3 meningar per svar)
- Var vänlig, professionell och hjälpsam
- Om kunden vill boka tid eller har specifika frågor du inte kan besvara, erbjud att ta deras kontaktuppgifter (namn och telefonnummer) så ringer vi upp
- Bekräfta alltid att du har förstått kundens förfrågan
- Säg aldrig att du är en AI om kunden inte frågar direkt
- Om du blir frågad, förklara att du är en AI-receptionist som hjälper till att besvara vanliga frågor
- Ge ALDRIG medicinsk, juridisk eller finansiell rådgivning
- Om kunden är missnöjd eller har klagomål, be om ursäkt och erbjud att koppla till en människa

## VIKTIGT - Detta är en DEMO:
Detta är en förhandsvisning av hur AI-receptionisten skulle fungera för ${business.name}.
Påminn användaren i slutet av samtalet att detta är en demo och fråga om de vill veta mer om hur de kan få sin egen AI-receptionist.`
}

export function getFirstMessage(business: ExtractedBusinessData): string {
  const intro = INDUSTRY_INTROS[business.industry] || INDUSTRY_INTROS.other
  return intro.replace('{name}', business.name)
}

export function getSuggestedQuestions(industry: Industry): string[] {
  return INDUSTRY_SUGGESTED_QUESTIONS[industry] || INDUSTRY_SUGGESTED_QUESTIONS.other
}
