import Link from 'next/link'

export function Hero() {
  return (
    <section className="min-h-screen bg-[#F4F3F3] flex items-center">
      <div className="w-full max-w-4xl mx-auto px-8 md:px-16 py-32">
        {/* Product Name */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-[#1D1C1B] mb-6">
          Anything<span className="text-[#4A4A4A]">Voice</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-[#4A4A4A] mb-12 max-w-2xl leading-relaxed">
          AI voice agents that answer calls, book appointments, and handle customer inquiries — so you don't have to.
        </p>

        {/* CTA */}
        <Link
          href="#demo"
          className="inline-flex px-8 py-4 bg-[#1D1C1B] text-white font-medium text-sm uppercase tracking-wider hover:bg-[#3A3A3A] transition-colors rounded-sm"
        >
          Try the Demo
        </Link>
      </div>
    </section>
  )
}
