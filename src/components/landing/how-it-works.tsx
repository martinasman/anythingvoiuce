import Link from 'next/link'
import { Container } from '@/components/ui/container'

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-20 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1F2C3A,#275379_45%,#5A9BC7)]" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,#BFD7EA33,transparent_50%)]" />
      <Container>
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-[10px] font-semibold">
                AV
              </span>
              Case study
            </div>
            <h2 className="text-3xl md:text-4xl font-display tracking-tight">
              The turnkey AI platform that helps your work flow
            </h2>
            <p className="mt-4 text-base text-white/80">
              Keep teams focused with automated intake, clear summaries, and instant
              follow-through.
            </p>
            <Link
              href="#"
              className="mt-6 inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1D1C1B]"
            >
              Read the story
            </Link>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg shadow-black/20">
            <div className="rounded-xl border border-white/20 bg-[#0F1E2A]/40 p-4">
              <div className="mb-4 flex items-center justify-between text-xs text-white/70">
                <span>Team Forecasting Agent</span>
                <span>Live</span>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-3/4 rounded-full bg-white/30" />
                <div className="h-3 w-2/3 rounded-full bg-white/20" />
                <div className="h-3 w-1/2 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
