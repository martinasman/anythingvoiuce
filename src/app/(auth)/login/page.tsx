import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white">
              Anything<span className="text-blue-500">Voice</span>
            </h1>
          </Link>
          <p className="text-zinc-400 mt-2">
            Logga in på din dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-sm mt-8">
          Genom att logga in godkänner du våra{' '}
          <a href="#" className="text-zinc-400 hover:text-white">
            användarvillkor
          </a>{' '}
          och{' '}
          <a href="#" className="text-zinc-400 hover:text-white">
            integritetspolicy
          </a>
        </p>
      </div>
    </div>
  )
}
