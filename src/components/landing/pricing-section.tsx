import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: [
      '100 minutes',
      '1 phone number',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$79',
    period: '/month',
    features: [
      '500 minutes',
      '3 phone numbers',
      '24/7 coverage',
      'Calendar sync',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited minutes',
      'Unlimited numbers',
      'Custom training',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <Container>
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-16 text-center">
          Pricing
        </h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'rounded-sm p-8',
                plan.highlighted
                  ? 'bg-[#1D1C1B] text-white'
                  : 'bg-[#F4F3F3]'
              )}
            >
              {/* Plan Name */}
              <h3
                className={cn(
                  'text-lg font-medium mb-4',
                  plan.highlighted ? 'text-white' : 'text-[#1D1C1B]'
                )}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={cn(
                    'text-3xl font-semibold',
                    plan.highlighted ? 'text-white' : 'text-[#1D1C1B]'
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    plan.highlighted ? 'text-white/60' : 'text-[#6B6B6B]'
                  )}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      'text-sm',
                      plan.highlighted ? 'text-white/80' : 'text-[#4A4A4A]'
                    )}
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={cn(
                  'w-full',
                  plan.highlighted
                    ? 'bg-white text-[#1D1C1B] hover:bg-[#ECECEC]'
                    : ''
                )}
                variant={plan.highlighted ? 'secondary' : 'primary'}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
