import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Anything Voice - AI Receptionist',
  description: 'AI-powered voice receptionists for Swedish businesses',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white font-sans`}
      >
        {children}
      </body>
    </html>
  )
}
