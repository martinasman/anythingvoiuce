import Image from 'next/image'
import Link from 'next/link'
import { Navbar, Hero } from '@/components/landing'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <footer className="bg-[#F4F3F3] py-8 px-6">
        <Link href="/" className="inline-block">
          <Image
            src="/anythingVoiceLogo.png"
            alt="AnythingVoice Logo"
            width={90}
            height={30}
          />
        </Link>
      </footer>
    </main>
  )
}
