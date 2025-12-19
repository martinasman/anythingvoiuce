'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import type { VoiceOption } from '@/types/database'

interface VoiceSelectorProps {
  businessId: string
  voices: VoiceOption[]
  selectedVoiceId: string | null
  onSelect?: (voiceId: string) => void
}

export function VoiceSelector({ businessId, voices, selectedVoiceId, onSelect }: VoiceSelectorProps) {
  const [selected, setSelected] = useState(selectedVoiceId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handleSelect = async (voiceId: string) => {
    if (voiceId === selected) return

    setSelected(voiceId)
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/business/${businessId}/voice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      onSelect?.(voiceId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save voice selection')
      setSelected(selectedVoiceId) // Revert on error
    } finally {
      setIsSaving(false)
    }
  }

  const handlePlayPreview = (voice: VoiceOption) => {
    if (!voice.preview_url) return

    if (playingId === voice.id) {
      setPlayingId(null)
      return
    }

    setPlayingId(voice.id)
    const audio = new Audio(voice.preview_url)
    audio.onended = () => setPlayingId(null)
    audio.onerror = () => setPlayingId(null)
    audio.play()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Välj röst</h3>
        <p className="text-sm text-zinc-500">
          Välj vilken röst din AI-receptionist ska använda.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleSelect(voice.voice_id)}
            disabled={isSaving}
            className={cn(
              'relative p-4 rounded-xl border-2 text-left transition-all',
              selected === voice.voice_id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
            )}
          >
            {/* Selection indicator */}
            {selected === voice.voice_id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Voice avatar */}
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                voice.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
              )}>
                {voice.gender === 'male' ? '👨' : '👩'}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium">{voice.display_name}</h4>
                <p className="text-zinc-500 text-sm mt-1 line-clamp-2">
                  {voice.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {voice.gender && (
                    <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded">
                      {voice.gender === 'male' ? 'Man' : voice.gender === 'female' ? 'Kvinna' : 'Neutral'}
                    </span>
                  )}
                  {voice.tone && (
                    <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded">
                      {voice.tone === 'professional' ? 'Professionell' :
                       voice.tone === 'friendly' ? 'Vänlig' :
                       voice.tone === 'warm' ? 'Varm' : voice.tone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Play preview button */}
            {voice.preview_url && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayPreview(voice)
                }}
                className="absolute bottom-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
              >
                {playingId === voice.id ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            )}
          </button>
        ))}
      </div>

      {isSaving && (
        <div className="flex items-center gap-2 text-zinc-400">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Sparar...</span>
        </div>
      )}
    </div>
  )
}
