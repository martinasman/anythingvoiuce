import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#BFD7EA] via-[#E1EFF9] to-white" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#BFD7EA]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#5A9BC7]/20 rounded-full blur-3xl" />

      {/* Sharp Angle Decorative Lines */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5A9BC7]/20 to-transparent transform -rotate-3" />
      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5A9BC7]/20 to-transparent transform rotate-2" />

      <Container className="relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="primary" className="mb-6">
            AI-Powered Voice Receptionist
          </Badge>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 mb-6">
            Never Miss Another{' '}
            <span className="text-[#5A9BC7]">Customer Call</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered voice receptionist that handles customer calls 24/7,
            schedules appointments, and answers questions — so you can focus
            on what matters.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg">
              Try Free Demo
            </Button>
            <Button variant="outline" size="lg">
              See How it Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Product Mock */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative">
            {/* Shadow */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/5 rounded-sm blur-2xl transform translate-y-4" />

            {/* Mock Window */}
            <div className="relative bg-white rounded-sm border border-slate-200 shadow-2xl overflow-hidden">
              {/* Window Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-4 flex-1 text-center text-sm text-slate-400">
                  AnythingVoice Demo
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 bg-gradient-to-br from-slate-50 to-white min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  {/* Phone Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#BFD7EA] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#275379]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 mb-2">Your AI Receptionist is ready</p>
                  <p className="text-2xl font-display text-slate-900">Click to start a demo call</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
