import { Container } from '@/components/ui/container'

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your account in 2 minutes. No credit card required.',
  },
  {
    number: '02',
    title: 'Configure',
    description: 'Tell us about your business — services, hours, and common questions.',
  },
  {
    number: '03',
    title: 'Go Live',
    description: 'Start receiving AI-handled calls immediately.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F4F3F3]">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-16 text-center">
            Get started in minutes
          </h2>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-block bg-[#1D1C1B] text-white text-sm font-medium px-3 py-1 rounded-sm mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-[#1D1C1B] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
