import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
