import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils/cn'

const features = [
  {
    title: '24/7 Availability',
    description: 'Your AI receptionist never sleeps. Answer every call, day or night, weekends and holidays included.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    size: 'large',
  },
  {
    title: 'Instant Response',
    description: 'Every call answered in under 3 seconds. No hold music, no waiting.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    size: 'medium',
  },
  {
    title: 'Smart Booking',
    description: 'Automatically schedules appointments directly into your calendar system.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    size: 'medium',
  },
  {
    title: 'Custom Training',
    description: 'AI learns your specific business, services, pricing, and FAQs for personalized responses.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    size: 'large',
  },
  {
    title: 'Natural Voice',
    description: 'Human-like conversations that keep callers engaged and satisfied.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    size: 'small',
  },
  {
    title: 'Multi-Language',
    description: 'Fluent in Swedish and English with more languages coming soon.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    size: 'small',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-white">
      <Container>
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-4">
            Everything you need to handle calls professionally
          </h2>
          <p className="text-lg text-[#4A4A4A]">
            Our AI receptionist combines cutting-edge technology with a personal touch to deliver exceptional customer experiences.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                'group relative bg-[#F4F3F3] border border-[#ECECEC] p-8 transition-all hover:border-[#BFD7EA] hover:shadow-lg',
                // Sharp corners
                'rounded-sm',
                // Size variations
                {
                  'lg:col-span-2 lg:row-span-1': feature.size === 'large' && index === 0,
                  'lg:col-span-1 lg:row-span-2': feature.size === 'large' && index > 0,
                }
              )}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-[#BFD7EA] text-[#275379] rounded-sm flex items-center justify-center mb-6 group-hover:bg-[#5A9BC7] group-hover:text-white transition-colors">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#4A4A4A] leading-relaxed">
                {feature.description}
              </p>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-[#BFD7EA]/0 group-hover:bg-[#BFD7EA]/30 transition-colors transform rotate-45 translate-x-4 -translate-y-4" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
