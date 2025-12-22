'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import type { CallStatus } from '@/hooks/use-vapi'

interface CallButtonProps {
  status: CallStatus
  volumeLevel: number
  onStart: () => void
  onEnd: () => void
}

// Siri-style bar configuration
const BARS = [0, 1, 2, 3, 4, 5, 6] // 7 bars for more fluid look
const BAR_PHASES = [0.2, 0.5, 0.8, 1.0, 0.7, 0.4, 0.1] // Staggered animation phases

export function CallButton({ status, volumeLevel, onStart, onEnd }: CallButtonProps) {
  const isActive = status === 'active'
  const isConnecting = status === 'connecting'
  const isEnded = status === 'ended'
  const [tick, setTick] = useState(0)

  // Animation tick for organic movement
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => setTick((t) => t + 1), 40)
    return () => clearInterval(interval)
  }, [isActive])

  const handleClick = () => {
    if (isActive) {
      onEnd()
    } else if (status === 'idle') {
      onStart()
    }
  }

  // Calculate bar height based on volume and phase
  const getBarHeight = (index: number) => {
    const phase = BAR_PHASES[index]
    const time = tick * 0.12 + phase * Math.PI * 2
    const wave = Math.sin(time) * 0.4 + 0.6
    const base = 16
    const range = 44
    return base + range * volumeLevel * wave
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Animated rings when idle */}
        {!isActive && !isConnecting && (
          <>
            <span className="absolute inset-[-8px] rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
            <span className="absolute inset-[-16px] rounded-full border border-white/5" />
          </>
        )}

        {/* Pulsing glow when active */}
        {isActive && (
          <>
            <span
              className="absolute inset-[-24px] rounded-full bg-gradient-to-r from-cyan-500/30 via-sky-500/30 to-blue-500/30 blur-2xl transition-all duration-150"
              style={{
                transform: `scale(${1 + volumeLevel * 0.3})`,
                opacity: 0.4 + volumeLevel * 0.6,
              }}
            />
            <span
              className="absolute inset-[-12px] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl"
              style={{
                opacity: 0.6 + volumeLevel * 0.4,
              }}
            />
          </>
        )}

        {/* Main button */}
        <button
          onClick={handleClick}
          disabled={isConnecting || isEnded}
          className={cn(
            'relative w-36 h-36 rounded-full transition-all duration-300',
            'flex items-center justify-center overflow-hidden',
            'focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-[#0A0A0A]',
            'shadow-2xl',
            isActive
              ? 'bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 focus:ring-sky-500/50'
              : 'bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 focus:ring-sky-500/50',
            (isConnecting || isEnded) && 'opacity-70 cursor-not-allowed'
          )}
        >
          {/* Inner gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full" />

          {/* Siri-style audio bars */}
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-[5px]">
                {BARS.map((i) => (
                  <span
                    key={i}
                    className="w-[4px] rounded-full bg-white transition-all duration-75"
                    style={{
                      height: `${getBarHeight(i)}px`,
                      opacity: 0.8 + volumeLevel * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Icon - hidden when bars are showing */}
          {!isActive && (
            <svg
              className={cn(
                'w-14 h-14 text-white relative z-10 transition-transform duration-300',
                isConnecting && 'animate-pulse'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isConnecting ? (
                // Loading spinner
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0l-2.121-2.121M8.757 8.757L6.636 6.636"
                  className="animate-spin origin-center"
                />
              ) : (
                // Microphone icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              )}
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
