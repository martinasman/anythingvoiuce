import { Container } from '@/components/ui/container'

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your account in just 2 minutes. No credit card required to get started.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Configure',
    description: 'Tell us about your business — services, hours, pricing, and common questions.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Train',
    description: 'We customize the AI specifically for your industry and unique requirements.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Go Live',
    description: 'Start receiving AI-handled calls immediately. Monitor and improve over time.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F4F3F3]">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-[#4A4A4A]">
            Four simple steps to transform how your business handles phone calls.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#BFD7EA] to-transparent transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Card */}
                <div className="bg-white border border-[#ECECEC] rounded-sm p-8 text-center relative z-10 h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#5A9BC7] text-white text-sm font-bold px-3 py-1 rounded-sm">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 mt-4 bg-[#E1EFF9] text-[#5A9BC7] rounded-sm flex items-center justify-center">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-[#1D1C1B] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#4A4A4A] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (mobile) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <svg className="w-6 h-6 text-[#BFD7EA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
