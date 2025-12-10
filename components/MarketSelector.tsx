'use client'

import { useState, useEffect } from 'react'
import { useMarkets } from '@/hooks/useHydromancer'
import { useTradingStore } from '@/lib/store'
import { formatPrice, formatPercentage, getChangeColor, formatCompactNumber } from '@/utils/formatters'

export default function MarketSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  const { data: markets } = useMarkets()
  const selectedSymbol = useTradingStore((state) => state.selectedSymbol)
  const setSelectedSymbol = useTradingStore((state) => state.setSelectedSymbol)
  const currentMarket = useTradingStore((state) => state.currentMarket)

  const filteredMarkets = markets?.filter((market) =>
    market.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectMarket = (symbol: string) => {
    setSelectedSymbol(symbol)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
      >
        <div className="text-left">
          <div className="font-semibold text-lg">{selectedSymbol}</div>
          {currentMarket && (
            <div className="flex items-center gap-2 text-sm">
              <span>{formatPrice(currentMarket.price)}</span>
              <span className={getChangeColor(currentMarket.change24h)}>
                {formatPercentage(currentMarket.change24h)}
              </span>
            </div>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-xl z-20 max-h-96 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search markets..."
                className="w-full px-3 py-2 bg-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto">
              {filteredMarkets?.map((market) => (
                <button
                  key={market.symbol}
                  onClick={() => handleSelectMarket(market.symbol)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-700 border-b border-slate-700 ${
                    market.symbol === selectedSymbol ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{market.symbol}</div>
                      <div className="text-xs text-gray-400">Vol: {formatCompactNumber(market.volume24h)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">{formatPrice(market.price)}</div>
                      <div className={`text-sm ${getChangeColor(market.change24h)}`}>
                        {formatPercentage(market.change24h)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>Vol: {formatCompactNumber(market.volume24h)}</span>
                    <span>H: {formatPrice(market.high24h)}</span>
                    <span>L: {formatPrice(market.low24h)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
