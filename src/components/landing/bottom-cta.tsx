import Link from 'next/link'
import { Container } from '@/components/ui/container'

export function BottomCTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-24 text-white scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-800" />
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_30%_20%,#BFD7EA44,transparent_55%)]" />
      <Container>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-display tracking-tight">
            Ready to put AI to work?
          </h2>
          <p className="mt-4 text-base text-white/80">
            Launch a guided pilot and see how fast your voice experience can improve.
          </p>
          <Link
            href="#"
            className="mt-8 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-medium text-white transition-all hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
          >
            Request a demo
          </Link>
        </div>
      </Container>
    </section>
  )
}
