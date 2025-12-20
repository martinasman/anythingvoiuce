import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

export function DemoCTA() {
  return (
    <section id="demo" className="py-24 bg-white">
      <Container>
        <div className="relative bg-[#1D1C1B] rounded-sm overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Sharp Angle Decoration */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 transform skew-x-12 translate-x-1/4" />

          <div className="relative px-8 py-16 md:px-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
                  Experience Your AI Receptionist
                </h2>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Try a live demo customized for your business type. See how natural and
                  helpful the AI really is — no signup required.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-[#1D1C1B] hover:bg-[#ECECEC]"
                  >
                    Try Live Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Schedule a Call
                  </Button>
                </div>
              </div>

              {/* Visual */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Phone Illustration */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-sm p-6 border border-white/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#ECECEC] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#1D1C1B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Incoming Call</p>
                        <p className="text-white/60 text-sm">AI Receptionist Active</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-sm p-3">
                        <p className="text-white/80 text-sm">
                          &quot;Hello! Thank you for calling. How can I help you today?&quot;
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-sm p-3 ml-8">
                        <p className="text-white/60 text-sm">
                          &quot;I&apos;d like to book an appointment for next Tuesday...&quot;
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-sm p-3">
                        <p className="text-white/80 text-sm">
                          &quot;Of course! Let me check our availability for Tuesday...&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
