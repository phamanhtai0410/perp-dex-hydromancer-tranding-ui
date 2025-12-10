'use client'

import { useState } from 'react'
import { usePlaceOrder } from '@/hooks/useHydromancer'
import { useTradingStore } from '@/lib/store'
import { formatUSD, validateOrderSize } from '@/utils/formatters'

export default function TradeForm() {
  const selectedSymbol = useTradingStore((state) => state.selectedSymbol)
  const currentMarket = useTradingStore((state) => state.currentMarket)
  const account = useTradingStore((state) => state.account)
  
  const [side, setSide] = useState<'long' | 'short'>('long')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')
  const [leverage, setLeverage] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const { mutate: placeOrder, isPending } = usePlaceOrder()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const sizeNum = parseFloat(size)
    const priceNum = orderType === 'limit' ? parseFloat(price) : currentMarket?.price || 0

    if (!sizeNum || sizeNum <= 0) {
      setError('Invalid size')
      return
    }

    if (orderType === 'limit' && (!priceNum || priceNum <= 0)) {
      setError('Invalid price')
      return
    }

    // Validate balance
    if (account) {
      const validation = validateOrderSize(sizeNum, priceNum, leverage, account.marginAvailable)
      if (!validation.valid) {
        setError(validation.message || 'Invalid order')
        return
      }
    }

    placeOrder({
      symbol: selectedSymbol,
      side,
      type: orderType,
      size: sizeNum,
      price: orderType === 'limit' ? priceNum : undefined,
      leverage,
    }, {
      onSuccess: () => {
        setSize('')
        setPrice('')
        setError(null)
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to place order')
      },
    })
  }

  const calculateMargin = () => {
    const sizeNum = parseFloat(size)
    const priceNum = orderType === 'limit' ? parseFloat(price) : currentMarket?.price || 0
    if (sizeNum && priceNum) {
      return (sizeNum * priceNum) / leverage
    }
    return 0
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Place Order</h2>

      {/* Side selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setSide('long')}
          className={`py-3 rounded font-semibold transition ${
            side === 'long'
              ? 'bg-green-500 text-white'
              : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setSide('short')}
          className={`py-3 rounded font-semibold transition ${
            side === 'short'
              ? 'bg-red-500 text-white'
              : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
          }`}
        >
          Short
        </button>
      </div>

      {/* Order type selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setOrderType('market')}
          className={`py-2 rounded text-sm ${
            orderType === 'market'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`py-2 rounded text-sm ${
            orderType === 'limit'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
          }`}
        >
          Limit
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Leverage selector */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Leverage: {leverage}x
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>100x</span>
          </div>
        </div>

        {/* Price input (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Size input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Size</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Order info */}
        <div className="bg-slate-900 rounded p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Margin Required</span>
            <span>{formatUSD(calculateMargin())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Available Balance</span>
            <span>{account ? formatUSD(account.marginAvailable) : '---'}</span>
          </div>
          {currentMarket && orderType === 'market' && (
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Price</span>
              <span>{formatUSD(currentMarket.price)}</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3 rounded font-semibold transition ${
            side === 'long'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? 'Placing Order...' : `${side === 'long' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
        </button>
      </form>
    </div>
  )
}
