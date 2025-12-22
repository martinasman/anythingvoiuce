import type { Industry } from '@/lib/claude/schemas'

interface VoiceConfig {
  voiceId: string
  voiceName: string
}

// Swedish ElevenLabs voices (proper Swedish, not "svengelsk")
// Jonas: calm, informative Swedish male - great for most industries
// Jonas Deep: deeper Swedish male - good for authority/trust
// Sanna Hartfield: professional Swedish female narrator - calm and soothing
const SWEDISH_VOICES = {
  jonas: { voiceId: 'e6OiUVixGLmvtdn2GJYE', voiceName: 'Jonas' },
  jonasDeep: { voiceId: 'Hyidyy6OA9R3GpDKGwoZ', voiceName: 'Jonas Deep' },
  sanna: { voiceId: '4xkUqaR9MYOJHoaC1Nak', voiceName: 'Sanna Hartfield' },
}

const INDUSTRY_VOICES: Record<Industry, VoiceConfig> = {
  restaurant: SWEDISH_VOICES.jonas,
  salon: SWEDISH_VOICES.sanna,
  clinic: SWEDISH_VOICES.sanna,
  contractor: SWEDISH_VOICES.jonasDeep,
  auto: SWEDISH_VOICES.jonasDeep,
  realestate: SWEDISH_VOICES.jonas,
  moving: SWEDISH_VOICES.jonasDeep,
  other: SWEDISH_VOICES.jonas,
}

export function getVoiceForIndustry(industry: Industry): VoiceConfig {
  return INDUSTRY_VOICES[industry] || SWEDISH_VOICES.jonas
}
