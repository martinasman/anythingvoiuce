import { Container } from '@/components/ui/container'

const tabs = [
  {
    title: 'Command',
    description: 'Route calls, gather context, and keep every conversation on track.',
  },
  {
    title: 'Connect',
    description: 'Sync calendars and CRMs so the right team follows up immediately.',
  },
  {
    title: 'Embed',
    description: 'Drop in APIs and webhooks for custom workflows without friction.',
  },
  {
    title: 'Refine',
    description: 'Monitor quality and tune performance with shared analytics.',
  },
]

export function DemoCTA() {
  return (
    <section id="models" className="bg-white py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-display tracking-tight text-[#1D1C1B]">
            Our models. All business.
          </h2>
          <p className="mt-4 text-base text-[#4A4A4A]">
            Everything you need to design calm, consistent voice experiences.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="rounded-2xl bg-[#F2F2F2] p-6">
            <div className="rounded-xl border border-[#E0E0E0] bg-white p-4">
              <div className="mb-4 flex items-center gap-3 text-xs text-[#6B6B6B]">
                <span className="rounded-full bg-[#ECECEC] px-3 py-1">AI Brief</span>
                <span>Updated 4 min ago</span>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-3/4 rounded-full bg-[#ECECEC]" />
                <div className="h-3 w-2/3 rounded-full bg-[#ECECEC]" />
                <div className="h-3 w-1/2 rounded-full bg-[#ECECEC]" />
                <div className="h-3 w-4/5 rounded-full bg-[#ECECEC]" />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button className="rounded-full bg-[#1D1C1B] px-4 py-2 text-xs font-medium text-white">
                  Approve
                </button>
                <button className="rounded-full border border-[#D4D4D4] px-4 py-2 text-xs font-medium text-[#1D1C1B]">
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {tabs.map((tab, index) => (
              <div key={tab.title} className="border-b border-[#ECECEC] pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1D1C1B]">
                    {tab.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-[#4A4A4A]">
                  {tab.description}
                </p>
                {index === 0 && (
                  <span
                    className="mt-4 block h-px w-24"
                    style={{ backgroundColor: 'var(--accent-blue)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
