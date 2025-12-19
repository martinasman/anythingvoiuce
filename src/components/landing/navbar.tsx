'use client'

import { cn } from '@/lib/utils/cn'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Industries', href: '#industries' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

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
          ? 'bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <Container>
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display text-2xl text-[#275379]">Anything</span>
            <span className="text-2xl font-semibold text-slate-900">Voice</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  scrolled
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-700 hover:text-slate-900'
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/pipeline"
              className={cn(
                'hidden sm:inline-flex text-sm font-medium transition-colors',
                scrolled
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-700 hover:text-slate-900'
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className={cn(
                'hidden sm:inline-flex text-sm font-medium transition-colors',
                scrolled
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-700 hover:text-slate-900'
              )}
            >
              Logga in
            </Link>
            <Link href="#demo">
              <Button size="sm">
                Testa Demo
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  )
}
