import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

export function DemoCTA() {
  return (
    <section id="demo" className="py-24 bg-white">
      <Container>
        <div className="bg-[#1D1C1B] rounded-sm px-8 py-16 md:px-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            Try it yourself
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Call our demo line and experience the AI agent firsthand. No signup required.
          </p>
          <Button
            size="lg"
            className="bg-white text-[#1D1C1B] hover:bg-[#ECECEC]"
          >
            Try Live Demo
          </Button>
        </div>
      </Container>
    </section>
  )
}
