import { Container } from '@/components/ui/container'

const stats = [
  {
    value: '< 3s',
    label: 'Response Time',
    description: 'Average time to answer incoming calls',
  },
  {
    value: '24/7',
    label: 'Availability',
    description: 'Always on, never takes a break',
  },
  {
    value: '2+',
    label: 'Languages',
    description: 'Swedish and English supported',
  },
  {
    value: '99.9%',
    label: 'Uptime',
    description: 'Reliable service guaranteed',
  },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#ECECEC]/30 to-white">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-4">
            Built for reliability
          </h2>
          <p className="text-lg text-[#4A4A4A]">
            Enterprise-grade infrastructure ensuring your customers always reach you.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              {/* Divider (not on first item) */}
              <div className="relative">
                {index > 0 && (
                  <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-px h-16 bg-[#ECECEC]" />
                )}

                {/* Value */}
                <div className="text-4xl md:text-5xl font-bold text-[#1D1C1B] mb-2">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-[#1D1C1B] mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-[#6B6B6B]">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
