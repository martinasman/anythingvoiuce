import Link from 'next/link'
import { Container } from '@/components/ui/container'

export function Hero() {
  return (
    <section id="platform" className="bg-[#F4F3F3] pt-32 pb-20 scroll-mt-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#6B6B6B]">
            Your next breakthrough
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-display tracking-tight text-[#1D1C1B]">
            Your next breakthrough,
            <br />
            powered by AI
          </h1>
          <p className="mt-6 text-lg text-[#4A4A4A] leading-relaxed">
            AnythingVoice helps teams answer every call, capture intent, and move work
            forward with calm, dependable voice automation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#cta"
              className="inline-flex items-center justify-center rounded-full bg-[#1D1C1B] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3A3A3A]"
            >
              Start a pilot
            </Link>
            <Link
              href="#solutions"
              className="text-sm font-medium text-[#1D1C1B] underline underline-offset-4"
            >
              Explore the platform
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className="h-px w-16"
              style={{ backgroundColor: 'var(--accent-blue)' }}
            />
            <span
              className="h-px w-10"
              style={{ backgroundColor: 'var(--accent-warm)' }}
            />
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="relative min-h-[260px] rounded-2xl bg-[linear-gradient(135deg,#E1EFF9,#BFD7EA)] p-6 md:min-h-[320px]">
            <div className="absolute left-6 top-6 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#1D1C1B]">
              Real-time intake
            </div>
            <div className="absolute right-6 top-16 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#1D1C1B]">
              Smart routing
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-[#1D1C1B]/85 p-4 text-white">
              <div className="mb-3 text-xs uppercase tracking-[0.3em] text-white/60">
                Live transcript
              </div>
              <div className="space-y-2">
                <div className="h-2 w-3/4 rounded-full bg-white/40" />
                <div className="h-2 w-2/3 rounded-full bg-white/30" />
                <div className="h-2 w-1/2 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
          <div className="min-h-[260px] rounded-2xl bg-[#ECECEC] md:min-h-[320px]">
            <div className="h-full w-full rounded-2xl border border-white/60" />
          </div>
        </div>
      </Container>
    </section>
  )
}
