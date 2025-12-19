import { Container } from '@/components/ui/container'

const industries = [
  {
    name: 'Restaurants',
    description: 'Handle table bookings, menu inquiries, and special requests automatically.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    name: 'Salons & Spas',
    description: 'Schedule appointments, describe services, and manage availability.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  {
    name: 'Medical Clinics',
    description: 'Book patient appointments, answer health inquiries, and manage schedules.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    name: 'Contractors',
    description: 'Handle quote requests, schedule site visits, and emergency callouts.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    color: 'bg-orange-50 text-orange-600 border-orange-200',
  },
  {
    name: 'Auto Shops',
    description: 'Book service appointments, provide repair quotes, and tire changes.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'bg-slate-100 text-slate-600 border-slate-300',
  },
  {
    name: 'Real Estate',
    description: 'Schedule property viewings, answer inquiries, and capture leads.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
]

export function Industries() {
  return (
    <section id="industries" className="py-24 bg-white">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Built for your industry
          </h2>
          <p className="text-lg text-slate-600">
            Pre-configured AI assistants tailored to the unique needs of different business types.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <div
              key={industry.name}
              className="group bg-white border border-slate-200 rounded-sm p-6 transition-all hover:border-[#BFD7EA] hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-sm flex items-center justify-center mb-4 border ${industry.color}`}>
                {industry.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {industry.name}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {industry.description}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center text-[#5A9BC7] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
