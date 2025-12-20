import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

export function BottomCTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-[#F4F3F3] to-[#ECECEC]">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-[#1D1C1B] mb-6">
            Ready to transform your customer service?
          </h2>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-[#4A4A4A] mb-10 leading-relaxed">
            Join hundreds of businesses using AnythingVoice to handle calls professionally,
            24/7. Start your free trial today — no credit card required.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Book a Demo
            </Button>
          </div>

          {/* Trust */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-[#6B6B6B]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#4A4A4A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#4A4A4A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GDPR Compliant</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <svg className="w-5 h-5 text-[#4A4A4A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
