'use client'

import { cn } from '@/lib/utils/cn'
import type { CallStatus } from '@/hooks/use-vapi'

interface CallButtonProps {
  status: CallStatus
  volumeLevel: number
  onStart: () => void
  onEnd: () => void
}

export function CallButton({ status, volumeLevel, onStart, onEnd }: CallButtonProps) {
  const isActive = status === 'active'
  const isConnecting = status === 'connecting'
  const isEnded = status === 'ended'

  const handleClick = () => {
    if (isActive) {
      onEnd()
    } else if (status === 'idle') {
      onStart()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Outer pulse rings when active */}
        {isActive && (
          <>
            <span
              className="absolute inset-0 rounded-full bg-rose-500/30 animate-pulse-ring"
              style={{ animationDelay: '0s' }}
            />
            <span
              className="absolute inset-0 rounded-full bg-rose-500/20 animate-pulse-ring"
              style={{ animationDelay: '0.5s' }}
            />
          </>
        )}

        {/* Volume visualization ring */}
        {isActive && (
          <span
            className="absolute inset-[-8px] rounded-full border-4 border-slate-300 transition-all duration-100"
            style={{
              transform: `scale(${1 + volumeLevel * 0.3})`,
              opacity: 0.3 + volumeLevel * 0.5,
            }}
          />
        )}

        {/* Main button */}
        <button
          onClick={handleClick}
          disabled={isConnecting || isEnded}
          className={cn(
            'relative w-32 h-32 rounded-full transition-all duration-300',
            'flex items-center justify-center',
            'focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-50',
            isActive
              ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/50'
              : 'bg-[#5A9BC7] hover:bg-[#4683AE] focus:ring-[#5A9BC7]/50',
            (isConnecting || isEnded) && 'opacity-70 cursor-not-allowed'
          )}
        >
          {/* Icon */}
          <svg
            className="w-12 h-12 text-white relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isActive ? (
              // End call icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : isConnecting ? (
              // Loading spinner
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                className="animate-spin origin-center"
              />
            ) : (
              // Phone icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Status text */}
      <p className="text-slate-500 text-sm font-medium">
        {status === 'idle' && 'Click to start a call'}
        {status === 'connecting' && 'Connecting...'}
        {status === 'active' && 'Call in progress - click to end'}
        {status === 'ended' && 'Call ended'}
      </p>
    </div>
  )
}
