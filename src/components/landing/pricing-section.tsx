import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses just getting started.',
    features: [
      '100 minutes included',
      'Basic call handling',
      'Email support',
      '1 phone number',
      'Business hours coverage',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$79',
    period: '/month',
    description: 'For growing businesses that need more power.',
    features: [
      '500 minutes included',
      'Advanced AI responses',
      'Priority support',
      '3 phone numbers',
      '24/7 coverage',
      'Calendar integrations',
      'Custom voice options',
    ],
    cta: 'Get Started',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs.',
    features: [
      'Unlimited minutes',
      'Custom AI training',
      'Dedicated support',
      'Unlimited numbers',
      '24/7 coverage',
      'All integrations',
      'SLA guarantee',
      'Custom analytics',
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
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600">
            No hidden fees. No surprises. Just honest pricing that scales with your business.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-sm p-8 transition-all',
                plan.highlighted
                  ? 'bg-[#275379] text-white ring-2 ring-[#5A9BC7] scale-105'
                  : 'bg-white border border-slate-200 hover:border-[#BFD7EA] hover:shadow-lg'
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5A9BC7] text-white">
                  {plan.badge}
                </Badge>
              )}

              {/* Plan Name */}
              <h3
                className={cn(
                  'text-xl font-semibold mb-2',
                  plan.highlighted ? 'text-white' : 'text-slate-900'
                )}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span
                  className={cn(
                    'text-4xl font-bold',
                    plan.highlighted ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {plan.price}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    plan.highlighted ? 'text-white/70' : 'text-slate-500'
                  )}
                >
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p
                className={cn(
                  'text-sm mb-6',
                  plan.highlighted ? 'text-white/80' : 'text-slate-600'
                )}
              >
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className={cn(
                        'w-5 h-5 mt-0.5 flex-shrink-0',
                        plan.highlighted ? 'text-[#BFD7EA]' : 'text-emerald-500'
                      )}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={cn(
                        'text-sm',
                        plan.highlighted ? 'text-white/90' : 'text-slate-600'
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={cn(
                  'w-full',
                  plan.highlighted
                    ? 'bg-white text-[#275379] hover:bg-slate-100'
                    : ''
                )}
                variant={plan.highlighted ? 'secondary' : 'primary'}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </Container>
    </section>
  )
}
