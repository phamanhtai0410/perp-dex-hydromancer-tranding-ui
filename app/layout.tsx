import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hydromancer Trading | Perpetual DEX',
  description: 'Trade perpetual contracts with Hydromancer API - Hyperliquid-like experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
