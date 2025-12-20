import { Container } from '@/components/ui/container'

const industries = [
  'Financial services',
  'Public sector',
  'Energy',
  'Healthcare',
  'Consumer',
  'Manufacturing',
]

export function StatsSection() {
  return (
    <section id="industries" className="bg-white py-24 scroll-mt-24">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B6B6B]">
              Powering progress
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display tracking-tight text-[#1D1C1B]">
              Powering progress across industries
            </h2>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4D4D4] text-[#4A4A4A] transition-colors hover:border-[#1D1C1B] hover:text-[#1D1C1B]"
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4D4D4] text-[#4A4A4A] transition-colors hover:border-[#1D1C1B] hover:text-[#1D1C1B]"
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-10 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
          {industries.map((industry) => (
            <div
              key={industry}
              className="min-w-[180px] snap-start rounded-2xl bg-[#ECECEC] p-4 sm:min-w-[220px] sm:p-5"
            >
              <span className="text-sm font-medium text-[#1D1C1B]">
                {industry}
              </span>
            </div>
          ))}
        </div>

        <div className="relative mt-6 h-px w-full bg-[#D4D4D4]">
          <span
            className="absolute left-[15%] top-0 h-px w-20"
            style={{ backgroundColor: 'var(--accent-blue)' }}
          />
          <span
            className="absolute left-[24%] top-0 h-px w-10"
            style={{ backgroundColor: 'var(--accent-warm)' }}
          />
        </div>
      </Container>
    </section>
  )
}
