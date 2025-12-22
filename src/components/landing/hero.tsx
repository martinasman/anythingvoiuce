import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/container'

export function Hero() {
  return (
    <section id="platform" className="bg-[#F4F3F3] pt-32 scroll-mt-24">
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
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              Book a demo
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
      </Container>

      <div className="mt-16 grid gap-4 md:grid-cols-[1.8fr_1fr]">
        <div className="relative min-h-[600px] overflow-hidden md:min-h-[800px]">
          <Image
            src="/anythingvoiceHeroImge1.png"
            alt="AnythingVoice Hero"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative min-h-[600px] overflow-hidden md:min-h-[800px]">
          <Image
            src="/anythingbackground.jpg"
            alt="AnythingVoice Background"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
