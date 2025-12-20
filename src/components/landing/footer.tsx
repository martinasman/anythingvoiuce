import { Container } from '@/components/ui/container'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1D1C1B] text-white py-12">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl text-[#ECECEC]">Anything</span>
              <span className="text-xl font-semibold text-white">Voice</span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 text-sm">
            <a href="#features" className="text-[#8A8A8A] hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-[#8A8A8A] hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#demo" className="text-[#8A8A8A] hover:text-white transition-colors">
              Demo
            </a>
            <a href="#faq" className="text-[#8A8A8A] hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[#6B6B6B] text-sm">
            &copy; {new Date().getFullYear()} Anything Labs
          </p>
        </div>
      </Container>
    </footer>
  )
}
