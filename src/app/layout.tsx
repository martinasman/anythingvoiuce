import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AnythingVoice - AI Voice Receptionist',
  description: 'AI-powered voice receptionist that handles customer calls 24/7, schedules appointments, and answers questions.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={syne.variable}>
      <body className="antialiased font-syne">
        {children}
      </body>
    </html>
  )
}
