import { Container } from '@/components/ui/container'

export function FAQAccordion() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B6B6B]">
            Why teams trust AnythingVoice
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-display tracking-tight text-[#1D1C1B]">
            Human-first voice experiences
          </h2>
          <p className="mt-4 text-base text-[#4A4A4A]">
            Designed for calm conversations, confident handoffs, and a consistent
            brand voice.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div
            className="rounded-2xl border border-[#E0E0E0] bg-[#F4F3F3] p-8"
            style={{ clipPath: 'polygon(0 0, 92% 0, 100% 100%, 0 100%)' }}
          >
            <p className="text-lg leading-relaxed text-[#1D1C1B]">
              "AnythingVoice brings clarity to every call. Our team finally feels
              ahead of the queue, not behind it."
            </p>
            <div className="mt-6 text-sm text-[#6B6B6B]">
              Operations Lead, Customer Experience
            </div>
          </div>
          <div className="min-h-[240px] rounded-2xl bg-[#ECECEC]" />
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative h-px w-40 bg-[#D4D4D4]">
            <span
              className="absolute left-1/2 top-0 h-px w-10 -translate-x-1/2"
              style={{ backgroundColor: 'var(--accent-blue)' }}
            />
            <span
              className="absolute left-[58%] top-0 h-px w-6"
              style={{ backgroundColor: 'var(--accent-warm)' }}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
