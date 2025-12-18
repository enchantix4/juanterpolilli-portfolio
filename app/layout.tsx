import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Juan Terpolilli Portfolio',
  description: 'Professional portfolio - Artist, producer, and creative director',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <body style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>{children}</body>
    </html>
  )
}


