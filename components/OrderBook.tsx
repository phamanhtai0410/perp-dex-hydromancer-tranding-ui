'use client'

import { useOrderBook } from '@/hooks/useHydromancer'
import { useTradingStore } from '@/lib/store'
import { formatPrice, formatCurrency } from '@/utils/formatters'

export default function OrderBook() {
  const selectedSymbol = useTradingStore((state) => state.selectedSymbol)
  const { data: orderBook, isLoading } = useOrderBook(selectedSymbol)

  if (isLoading || !orderBook) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 h-[600px] flex items-center justify-center">
        <div className="text-gray-400">Loading order book...</div>
      </div>
    )
  }

  const asks = orderBook.asks.slice(0, 15).reverse()
  const bids = orderBook.bids.slice(0, 15)

  const maxBidVolume = Math.max(...bids.map(([, size]) => size))
  const maxAskVolume = Math.max(...asks.map(([, size]) => size))
  const maxVolume = Math.max(maxBidVolume, maxAskVolume)

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Order Book</h2>
      
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2 px-2">
        <div className="text-left">Price (USD)</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell orders) */}
      <div className="space-y-0.5 mb-2">
        {asks.map(([price, size], index) => {
          const total = price * size
          const percentage = (size / maxVolume) * 100
          return (
            <div
              key={`ask-${index}`}
              className="relative grid grid-cols-3 gap-2 text-sm px-2 py-1 hover:bg-slate-700 cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-red-500 opacity-10"
                style={{ width: `${percentage}%` }}
              />
              <div className="text-red-500 z-10">{formatPrice(price)}</div>
              <div className="text-right z-10">{formatCurrency(size, 4)}</div>
              <div className="text-right text-gray-400 z-10">{formatCurrency(total, 2)}</div>
            </div>
          )
        })}
      </div>

      {/* Spread */}
      <div className="bg-slate-900 py-2 px-4 rounded my-3 text-center">
        <div className="text-lg font-mono font-bold">
          {orderBook.asks.length > 0 && orderBook.bids.length > 0 ? 
            formatPrice((orderBook.asks[0][0] + orderBook.bids[0][0]) / 2) : 
            '---'}
        </div>
        <div className="text-xs text-gray-400">
          Spread: {orderBook.asks.length > 0 && orderBook.bids.length > 0 ? 
            formatPrice(orderBook.asks[0][0] - orderBook.bids[0][0]) : 
            '---'}
        </div>
      </div>

      {/* Bids (Buy orders) */}
      <div className="space-y-0.5">
        {bids.map(([price, size], index) => {
          const total = price * size
          const percentage = (size / maxVolume) * 100
          return (
            <div
              key={`bid-${index}`}
              className="relative grid grid-cols-3 gap-2 text-sm px-2 py-1 hover:bg-slate-700 cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-green-500 opacity-10"
                style={{ width: `${percentage}%` }}
              />
              <div className="text-green-500 z-10">{formatPrice(price)}</div>
              <div className="text-right z-10">{formatCurrency(size, 4)}</div>
              <div className="text-right text-gray-400 z-10">{formatCurrency(total, 2)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
