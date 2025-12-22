'use client'

import { cn } from '@/lib/utils/cn'
import { Container } from '@/components/ui/container'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm border-b border-[#ECECEC] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <Container>
        <div className="flex items-center justify-between py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/anythingVoiceLogo.png"
              alt="AnythingVoice Logo"
              width={90}
              height={30}
              priority
            />
          </Link>

          {/* Admin Link */}
          <Link
            href="/admin/pipeline"
            className={cn(
              'text-sm font-medium transition-colors',
              scrolled
                ? 'text-[#4A4A4A] hover:text-[#1D1C1B]'
                : 'text-[#3A3A3A] hover:text-[#1D1C1B]'
            )}
          >
            Admin
          </Link>
        </div>
      </Container>
    </nav>
  )
}
