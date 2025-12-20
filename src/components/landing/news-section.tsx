import Link from 'next/link'
import { Container } from '@/components/ui/container'

const news = [
  {
    title: 'Designing dependable AI voice for customer teams',
    meta: 'Insight',
  },
  {
    title: 'What calm automation looks like in production',
    meta: 'Report',
  },
  {
    title: 'From pilot to rollout: scaling with confidence',
    meta: 'Story',
  },
]

export function NewsSection() {
  return (
    <section id="resources" className="bg-[#F4F3F3] py-24 scroll-mt-24">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B6B6B]">
              The latest news
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-display tracking-tight text-[#1D1C1B]">
              Fresh thinking from the field
            </h2>
          </div>
          <Link
            href="#"
            className="text-sm font-medium text-[#1D1C1B] underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {news.map((item) => (
            <div
              key={item.title}
              className="relative rounded-2xl border border-[#E0E0E0] bg-[#F4F3F3] p-6"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)',
              }}
            >
              <div className="mb-5 h-32 rounded-xl border border-[#E0E0E0] bg-white" />
              <p className="text-xs uppercase tracking-[0.25em] text-[#6B6B6B]">
                {item.meta}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[#1D1C1B]">
                {item.title}
              </h3>
              <div className="mt-6 flex items-center justify-between text-sm text-[#1D1C1B]">
                <Link href="#" className="underline underline-offset-4">
                  Read story
                </Link>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path
                    d="M7 12h10M13 7l4 5-4 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
