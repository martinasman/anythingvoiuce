import Link from 'next/link'
import { Container } from '@/components/ui/container'

const columns = [
  {
    title: 'Product',
    links: ['Platform', 'Security', 'Integrations', 'Pricing'],
  },
  {
    title: 'Solutions',
    links: ['Contact centers', 'Healthcare', 'Financial services', 'Retail'],
  },
  {
    title: 'Developers',
    links: ['Docs', 'API status', 'Changelog', 'Guides'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Contact'],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#1D1C1B] py-16 text-[#A0A0A0]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-1 text-white">
              <span className="text-xl font-display">Anything</span>
              <span className="text-xl font-semibold">Voice</span>
            </Link>
            <p className="mt-4 text-sm text-[#8A8A8A]">
              Calm, dependable AI voice experiences for modern businesses.
            </p>
            <div className="mt-6">
              <label htmlFor="footer-email" className="text-xs uppercase tracking-[0.3em] text-[#8A8A8A]">
                Stay in the loop
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Email address"
                  className="w-full max-w-[240px] bg-transparent pb-2 text-sm text-white placeholder:text-[#6B6B6B] border-b border-[#3A3A3A] focus:border-white focus:outline-none"
                />
                <button className="text-sm font-medium text-white">Join</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="text-sm font-semibold text-white">{column.title}</h4>
                <ul className="mt-4 space-y-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-[#8A8A8A] hover:text-white">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#2A2A2A] pt-6 text-xs text-[#6B6B6B] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
            <Link href="#" className="hover:text-white">
              Accessibility
            </Link>
          </div>
          <div className="flex items-center gap-3 text-[#8A8A8A]">
            <Link href="#" className="hover:text-white">X</Link>
            <Link href="#" className="hover:text-white">LinkedIn</Link>
            <Link href="#" className="hover:text-white">YouTube</Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
