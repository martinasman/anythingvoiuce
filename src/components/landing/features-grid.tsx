import Link from 'next/link'
import { Container } from '@/components/ui/container'

const logos = ['Northwind', 'Mosaic', 'Fieldline', 'Citrine', 'Ironclad']

const features = [
  {
    title: 'Secure by design',
    description:
      'Enterprise-grade controls, audit trails, and clear accountability from first call.',
    link: 'Security overview',
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#1D1C1B]" fill="none">
        <path
          d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9.5 12.5l2 2 3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Flexible deployment',
    description:
      'Launch quickly with guided setup or integrate deeply with your existing stack.',
    link: 'Deployment options',
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#1D1C1B]" fill="none">
        <path
          d="M4 7h16M4 12h16M4 17h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Calm for customers',
    description:
      'Natural voice experiences that feel reliable, friendly, and always available.',
    link: 'Experience guide',
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#1D1C1B]" fill="none">
        <path
          d="M12 4c4.4 0 8 2.9 8 6.5S16.4 17 12 17s-8-2.9-8-6.5S7.6 4 12 4z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 20l4-3 4 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function FeaturesGrid() {
  return (
    <section id="solutions" className="bg-white py-24 scroll-mt-24">
      <Container>
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B6B6B]">
            Trusted by modern teams
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm font-medium text-[#1D1C1B]/70">
            {logos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display tracking-tight text-[#1D1C1B]">
            Safe. Flexible. Built for business.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#4A4A4A]">
            Keep the experience clean and predictable while giving your team the tools
            to automate and scale.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="text-center md:text-left">
              <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-[#F4F3F3] p-3">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#1D1C1B]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#4A4A4A]">
                {feature.description}
              </p>
              <Link
                href="#"
                className="mt-4 inline-flex text-sm font-medium text-[#1D1C1B] underline underline-offset-4"
              >
                {feature.link}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
