import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

export function BottomCTA() {
  return (
    <section className="py-24 bg-[#ECECEC]">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-8">
            Ready to get started?
          </h2>
          <Button size="lg">
            Start Free Trial
          </Button>
        </div>
      </Container>
    </section>
  )
}
