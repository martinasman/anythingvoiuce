import Image from 'next/image'
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
          <div className="relative min-h-[400px] rounded-2xl overflow-hidden flex items-center justify-center">
            <Image
              src="/anythingBackground2.jpeg"
              alt="Transform Your Calls"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-center px-8">
              <h3 className="text-4xl md:text-5xl font-bold text-white">
                Transform Your Calls
              </h3>
              <button className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-[#1D1C1B] transition-colors hover:bg-gray-100">
                Book a Demo
              </button>
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
