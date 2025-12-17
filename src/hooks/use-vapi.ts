'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Vapi from '@vapi-ai/web'

export type CallStatus = 'idle' | 'connecting' | 'active' | 'ended'

interface UseVapiOptions {
  publicKey: string
  assistantId: string
  onCallStart?: () => void
  onCallEnd?: (duration?: number) => void
  onMessage?: (message: VapiMessage) => void
  onVolumeLevel?: (level: number) => void
  onError?: (error: Error) => void
}

interface VapiMessage {
  type: string
  transcript?: string
  transcriptType?: 'partial' | 'final'
  role?: 'user' | 'assistant'
  [key: string]: unknown
}

export function useVapi({
  publicKey,
  assistantId,
  onCallStart,
  onCallEnd,
  onMessage,
  onVolumeLevel,
  onError,
}: UseVapiOptions) {
  const vapiRef = useRef<Vapi | null>(null)
  const callStartTime = useRef<number | null>(null)
  const [status, setStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [transcript, setTranscript] = useState<string>('')

  useEffect(() => {
    if (!publicKey) return

    const vapi = new Vapi(publicKey)
    vapiRef.current = vapi

    vapi.on('call-start', () => {
      callStartTime.current = Date.now()
      setStatus('active')
      setTranscript('')
      onCallStart?.()
    })

    vapi.on('call-end', () => {
      const duration = callStartTime.current
        ? Math.round((Date.now() - callStartTime.current) / 1000)
        : undefined
      callStartTime.current = null
      setStatus('ended')
      setVolumeLevel(0)
      setTimeout(() => setStatus('idle'), 2000)
      onCallEnd?.(duration)
    })

    vapi.on('message', (message: VapiMessage) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const role = message.role === 'assistant' ? 'AI' : 'Du'
        setTranscript((prev) => {
          const newLine = `${role}: ${message.transcript}`
          return prev ? `${prev}\n${newLine}` : newLine
        })
      }
      onMessage?.(message)
    })

    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level)
      onVolumeLevel?.(level)
    })

    vapi.on('error', (error: unknown) => {
      // Extract all possible error information for debugging
      const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
        raw: JSON.stringify(error, null, 2),
      }
      console.error('Vapi error:', errorInfo)
      setStatus('idle')
      onError?.(error instanceof Error ? error : new Error(String(error)))
    })

    vapi.on('call-start-failed', (event: unknown) => {
      console.error('Vapi call start failed:', event)
      setStatus('idle')
    })

    // Track progress through each stage to identify where failures occur
    vapi.on('call-start-progress', (event: unknown) => {
      console.log('Vapi progress:', event)
    })

    return () => {
      vapi.stop()
    }
  }, [publicKey, onCallStart, onCallEnd, onMessage, onVolumeLevel, onError])

  const startCall = useCallback(async () => {
    if (!vapiRef.current || status !== 'idle') return

    if (!assistantId) {
      console.error('Cannot start call: assistantId is missing')
      onError?.(new Error('Assistant ID is required'))
      return
    }

    setStatus('connecting')
    try {
      console.log('Starting Vapi call with assistantId:', assistantId)
      await vapiRef.current.start(assistantId)
    } catch (error) {
      console.error('Failed to start call:', error)
      setStatus('idle')
      onError?.(error as Error)
    }
  }, [assistantId, status, onError])

  const endCall = useCallback(() => {
    if (!vapiRef.current) return
    vapiRef.current.stop()
  }, [])

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return
    const newMuted = !isMuted
    vapiRef.current.setMuted(newMuted)
    setIsMuted(newMuted)
  }, [isMuted])

  return {
    status,
    isMuted,
    volumeLevel,
    transcript,
    startCall,
    endCall,
    toggleMute,
  }
}
