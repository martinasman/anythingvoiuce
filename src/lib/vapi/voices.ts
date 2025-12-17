import type { Industry } from '@/lib/claude/schemas'

interface VoiceConfig {
  voiceId: string
  voiceName: string
}

const INDUSTRY_VOICES: Record<Industry, VoiceConfig> = {
  restaurant: { voiceId: 'CwhRBWXzGAHq8TQ4Fs17', voiceName: 'Roger' },
  salon: { voiceId: 'EXAVITQu4vr4xnSDxMaL', voiceName: 'Sarah' },
  clinic: { voiceId: 'XB0fDUnXU5powFXDhCwa', voiceName: 'Charlotte' },
  contractor: { voiceId: 'CwhRBWXzGAHq8TQ4Fs17', voiceName: 'Roger' },
  auto: { voiceId: 'CwhRBWXzGAHq8TQ4Fs17', voiceName: 'Roger' },
  realestate: { voiceId: 'XB0fDUnXU5powFXDhCwa', voiceName: 'Charlotte' },
  other: { voiceId: 'EXAVITQu4vr4xnSDxMaL', voiceName: 'Sarah' },
}

export function getVoiceForIndustry(industry: Industry): VoiceConfig {
  return INDUSTRY_VOICES[industry] || INDUSTRY_VOICES.other
}
