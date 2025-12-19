'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Customer } from '@/types/database'

interface DashboardHeaderProps {
  customer: Customer | null
  title?: string
}

export function DashboardHeader({ customer, title }: DashboardHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div>
        {title && <h1 className="text-xl font-semibold text-white">{title}</h1>}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 hover:bg-zinc-800 px-3 py-2 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {customer?.name?.[0]?.toUpperCase() || customer?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-white">
              {customer?.name || customer?.company_name || 'Användare'}
            </p>
            <p className="text-xs text-zinc-500">{customer?.email}</p>
          </div>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-20 py-1">
              <div className="px-4 py-3 border-b border-zinc-700">
                <p className="text-sm font-medium text-white">
                  {customer?.name || 'Användare'}
                </p>
                <p className="text-xs text-zinc-500 truncate">{customer?.email}</p>
              </div>

              <a
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Inställningar
              </a>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isLoggingOut ? 'Loggar ut...' : 'Logga ut'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
