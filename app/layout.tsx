'use client'

import type { Metadata } from 'next'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>Hydromancer Trading | Perpetual DEX</title>
        <meta name="description" content="Trade perpetual contracts with Hydromancer API - Hyperliquid-like experience" />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}
