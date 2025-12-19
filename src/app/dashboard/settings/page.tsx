import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/lib/supabase/auth'
import { PromptEditor } from '@/components/settings/prompt-editor'
import { VoiceSelector } from '@/components/settings/voice-selector'
import { formatPhoneDisplay } from '@/lib/46elks/client'
import type { VoiceOption } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const customer = await getCurrentCustomer()
  const supabase = await createSupabaseServerClient()

  if (!customer) {
    return null
  }

  // Get customer's business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('customer_id', customer.id)
    .single()

  // Get phone number
  const { data: phoneNumber } = await supabase
    .from('phone_numbers')
    .select('*')
    .eq('customer_id', customer.id)
    .single()

  // Get available voices
  const { data: voices } = await supabase
    .from('voice_options')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const hasSetup = !!business

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Inställningar</h1>
        <p className="text-zinc-400 mt-1">
          Anpassa din AI-receptionist
        </p>
      </div>

      {!hasSetup ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <svg
            className="w-12 h-12 text-zinc-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">
            Konfigurera din AI-receptionist först
          </h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Du behöver konfigurera din AI-receptionist innan du kan ändra inställningar.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Starta konfiguration
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          {/* Phone number section */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Telefonnummer</h2>
            {phoneNumber ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white font-mono">
                    {phoneNumber.phone_number_display || formatPhoneDisplay(phoneNumber.phone_number)}
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Status: <span className="text-green-400">Aktiv</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">Ansluten</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-zinc-400">Inget telefonnummer konfigurerat</p>
                <Link
                  href="/onboarding"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Konfigurera telefonnummer
                </Link>
              </div>
            )}
          </section>

          {/* Voice selection */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <VoiceSelector
              businessId={business.id}
              voices={(voices as VoiceOption[]) || []}
              selectedVoiceId={business.voice_id}
            />
          </section>

          {/* Prompt editor */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <PromptEditor
              businessId={business.id}
              initialPrompt={business.custom_system_prompt || business.agent_prompt || ''}
            />
          </section>

          {/* Notifications link */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Notifieringar</h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Konfigurera WhatsApp och e-postnotifieringar
                </p>
              </div>
              <Link
                href="/dashboard/settings/notifications"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                Hantera
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>

          {/* Account info */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Konto</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500">E-post</p>
                <p className="text-white">{customer.email}</p>
              </div>
              {customer.company_name && (
                <div>
                  <p className="text-sm text-zinc-500">Företag</p>
                  <p className="text-white">{customer.company_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-500">Prenumeration</p>
                <p className="text-white capitalize">
                  {customer.subscription_status === 'trial' ? 'Provperiod' :
                   customer.subscription_status === 'active' ? 'Aktiv' :
                   customer.subscription_status === 'paused' ? 'Pausad' : 'Avslutad'}
                </p>
                {customer.trial_ends_at && customer.subscription_status === 'trial' && (
                  <p className="text-zinc-500 text-sm">
                    Provperioden slutar {new Date(customer.trial_ends_at).toLocaleDateString('sv-SE')}
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
