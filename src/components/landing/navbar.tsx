'use client'

import { cn } from '@/lib/utils/cn'
import { Container } from '@/components/ui/container'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Industries', href: '#industries' },
  { label: 'Developers', href: '#developers' },
  { label: 'Resources', href: '#resources' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur-sm border-b border-[#ECECEC] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <Container>
        <div className="flex items-center justify-between py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display text-xl tracking-tight text-[#1D1C1B]">Anything</span>
            <span className="text-xl font-semibold tracking-tight text-[#1D1C1B]">Voice</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  scrolled
                    ? 'text-[#4A4A4A] hover:text-[#1D1C1B]'
                    : 'text-[#3A3A3A] hover:text-[#1D1C1B]'
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
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
            <Link
              href="/login"
              className={cn(
                'text-sm font-medium transition-colors',
                scrolled
                  ? 'text-[#4A4A4A] hover:text-[#1D1C1B]'
                  : 'text-[#3A3A3A] hover:text-[#1D1C1B]'
              )}
            >
              Sign in
            </Link>
            <Link
              href="#cta"
              className="inline-flex items-center rounded-full bg-[#1D1C1B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3A3A3A]"
            >
              Get a demo
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-full border border-[#D4D4D4] p-2"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="block h-0.5 w-5 bg-[#1D1C1B]" />
            <span className="mt-1 block h-0.5 w-5 bg-[#1D1C1B]" />
            <span className="mt-1 block h-0.5 w-5 bg-[#1D1C1B]" />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden mb-4 rounded-2xl border border-[#ECECEC] bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#1D1C1B]"
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-[#ECECEC]" />
              <Link
                href="/admin/pipeline"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#4A4A4A]"
              >
                Admin
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#4A4A4A]"
              >
                Sign in
              </Link>
              <Link
                href="#cta"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#1D1C1B] px-4 py-2 text-sm font-medium text-white"
              >
                Get a demo
              </Link>
            </div>
          </div>
        )}
      </Container>
    </nav>
  )
}
