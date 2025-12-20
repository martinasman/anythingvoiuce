import { Container } from '@/components/ui/container'

const features = [
  {
    title: '24/7 Availability',
    description: 'Your AI receptionist never sleeps. Answer every call, day or night, weekends and holidays included.',
  },
  {
    title: 'Instant Response',
    description: 'Every call answered in under 3 seconds. No hold music, no waiting.',
  },
  {
    title: 'Smart Booking',
    description: 'Automatically schedules appointments directly into your calendar system.',
  },
  {
    title: 'Custom Training',
    description: 'AI learns your specific business, services, pricing, and FAQs for personalized responses.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-white">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-4">
            Four ways we improve your customer service
          </h2>
          <p className="text-lg text-[#4A4A4A]">
            Our AI receptionist combines cutting-edge technology with a personal touch.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1 - Large Left Card */}
          <div className="lg:row-span-3 bg-[#1D1C1B] rounded-sm p-8 flex flex-col">
            {/* Image Placeholder */}
            <div className="flex-1 bg-[#3A3A3A] rounded-sm mb-6 min-h-[200px] lg:min-h-[300px] flex items-center justify-center">
              <div className="text-[#6B6B6B] text-sm">Image Placeholder</div>
            </div>
            {/* Content */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {features[0].title}
              </h3>
              <p className="text-[#8A8A8A] leading-relaxed">
                {features[0].description}
              </p>
            </div>
          </div>

          {/* Card 2 - Top Right */}
          <div className="bg-[#ECECEC] rounded-sm p-6 flex flex-col">
            {/* Image Placeholder */}
            <div className="bg-[#D4D4D4] rounded-sm mb-4 h-32 flex items-center justify-center">
              <div className="text-[#6B6B6B] text-sm">Image Placeholder</div>
            </div>
            {/* Content */}
            <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
              {features[1].title}
            </h3>
            <p className="text-[#4A4A4A] text-sm leading-relaxed">
              {features[1].description}
            </p>
          </div>

          {/* Card 3 - Middle Right */}
          <div className="bg-white border border-[#ECECEC] rounded-sm p-6 flex flex-col">
            {/* Image Placeholder */}
            <div className="bg-[#F4F3F3] rounded-sm mb-4 h-32 flex items-center justify-center">
              <div className="text-[#6B6B6B] text-sm">Image Placeholder</div>
            </div>
            {/* Content */}
            <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
              {features[2].title}
            </h3>
            <p className="text-[#4A4A4A] text-sm leading-relaxed">
              {features[2].description}
            </p>
          </div>

          {/* Card 4 - Bottom Right */}
          <div className="bg-[#F4F3F3] rounded-sm p-6 flex flex-col">
            {/* Image Placeholder */}
            <div className="bg-[#ECECEC] rounded-sm mb-4 h-32 flex items-center justify-center">
              <div className="text-[#6B6B6B] text-sm">Image Placeholder</div>
            </div>
            {/* Content */}
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
