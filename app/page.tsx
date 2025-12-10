'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'
import MarketSelector from '@/components/MarketSelector'
import TradingChart from '@/components/TradingChart'
import OrderBook from '@/components/OrderBook'
import TradeForm from '@/components/TradeForm'
import Positions from '@/components/Positions'
import Orders from '@/components/Orders'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useMarketData, usePositions, useAccount, useAPIWalletSync } from '@/hooks/useHydromancer'
import { useTradingStore } from '@/lib/store'

export default function HomePage() {
  const selectedSymbol = useTradingStore((state) => state.selectedSymbol)
  const ws = useWebSocket()
  
  // Sync API with wallet
  useAPIWalletSync()
  
  // Load initial data
  useMarketData(selectedSymbol)
  usePositions()
  useAccount()

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4">
          {/* Market selector */}
          <div className="mb-4">
            <MarketSelector />
          </div>

          {/* Main trading interface */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Left: Chart */}
            <div className="col-span-9">
              <TradingChart />
            </div>

            {/* Right: Order Book & Trade Form */}
            <div className="col-span-3 space-y-4">
              <OrderBook />
            </div>
          </div>

          {/* Trading form in separate row */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-9"></div>
            <div className="col-span-3">
              <TradeForm />
            </div>
          </div>

          {/* Bottom: Positions & Orders */}
          <div className="space-y-4">
            <Positions />
            <Orders />
          </div>
        </div>
      </main>
    </div>
  )
}
