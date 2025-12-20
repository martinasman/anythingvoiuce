import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen bg-[#F4F3F3] overflow-hidden">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Content */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-32 lg:py-0">
          {/* Intro Text */}
          <p className="text-[#6B6B6B] text-sm font-medium tracking-wide mb-4">
            Introducing
          </p>

          {/* Product Name */}
          <div className="flex items-baseline gap-4 mb-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-[#1D1C1B]">
              Anything
              <span className="text-[#5A9BC7]">Voice</span>
            </h1>
            <span className="text-lg md:text-xl font-medium text-[#1D1C1B] border border-[#1D1C1B] rounded px-2 py-0.5">
              1.0
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D1C1B] text-white font-medium text-sm uppercase tracking-wider hover:bg-[#3A3A3A] transition-colors"
            >
              Learn More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#1D1C1B] text-[#1D1C1B] font-medium text-sm uppercase tracking-wider hover:bg-[#1D1C1B] hover:text-white transition-colors"
            >
              Try Demo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Side - Visual Placeholder */}
        <div className="relative hidden lg:block">
          {/* Isometric Grid Pattern Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* SVG Isometric Pattern */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 800 800"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="isometric-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path
                    d="M0 30 L30 0 M30 60 L60 30 M0 30 L30 60 M30 0 L60 30"
                    stroke="#D4D4D4"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#isometric-grid)" />
            </svg>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F4F3F3]/80 via-transparent to-[#E1EFF9]/40" />

            {/* 3D Shape Placeholder */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
              {/* Placeholder for future 3D illustration */}
              <div className="w-full h-full bg-gradient-to-br from-[#BFD7EA]/30 via-[#5A9BC7]/20 to-[#E1EFF9]/40 rounded-3xl transform rotate-12 blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
