import { Container } from '@/components/ui/container'

const features = [
  {
    title: 'Always On',
    description: 'Your AI agent never sleeps. Every call answered, day or night.',
  },
  {
    title: 'Instant Pickup',
    description: 'Calls answered in under 3 seconds. No hold music.',
  },
  {
    title: 'Books Appointments',
    description: 'Schedules directly into your calendar system.',
  },
  {
    title: 'Learns Your Business',
    description: 'Trained on your services, pricing, and FAQs.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-white">
      <Container>
        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {/* Card 1 - Large Left Card */}
          <div className="lg:row-span-3 bg-[#1D1C1B] rounded-sm p-8 flex flex-col justify-end min-h-[400px]">
            <h3 className="text-2xl font-semibold text-white mb-3">
              {features[0].title}
            </h3>
            <p className="text-[#8A8A8A] leading-relaxed">
              {features[0].description}
            </p>
          </div>

          {/* Card 2 - Top Right */}
          <div className="bg-[#ECECEC] rounded-sm p-6">
            <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
              {features[1].title}
            </h3>
            <p className="text-[#4A4A4A] text-sm leading-relaxed">
              {features[1].description}
            </p>
          </div>

          {/* Card 3 - Middle Right */}
          <div className="bg-white border border-[#ECECEC] rounded-sm p-6">
            <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
              {features[2].title}
            </h3>
            <p className="text-[#4A4A4A] text-sm leading-relaxed">
              {features[2].description}
            </p>
          </div>

          {/* Card 4 - Bottom Right */}
          <div className="bg-[#F4F3F3] rounded-sm p-6">
            <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
              {features[3].title}
            </h3>
            <p className="text-[#4A4A4A] text-sm leading-relaxed">
              {features[3].description}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
