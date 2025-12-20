import Link from 'next/link'
import { Container } from '@/components/ui/container'

export function PricingSection() {
  return (
    <section id="developers" className="relative overflow-hidden py-20 text-white scroll-mt-24">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1B2740,#2B4372_45%,#5A9BC7)]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_30%,#BFD7EA33,transparent_55%)]" />
      <Container>
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Developer resources
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-display tracking-tight">
              Build with confidence
            </h2>
            <p className="mt-4 text-base text-white/80">
              Documentation, APIs, and examples designed for teams who want fast
              integrations without noisy tooling.
            </p>
            <Link
              href="#"
              className="mt-6 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1D1C1B]"
            >
              Explore docs
            </Link>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl shadow-black/30">
            <div className="rounded-xl border border-white/20 bg-[#0F1E2A]/40 p-5">
              <div className="mb-4 flex items-center justify-between text-xs text-white/70">
                <span>API Reference</span>
                <span>v2.4</span>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-3/4 rounded-full bg-white/25" />
                <div className="h-3 w-2/3 rounded-full bg-white/20" />
                <div className="h-3 w-4/5 rounded-full bg-white/20" />
                <div className="h-3 w-1/2 rounded-full bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
