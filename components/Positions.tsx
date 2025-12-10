'use client'

import { useTradingStore } from '@/lib/store'
import { formatUSD, formatPercentage, getChangeColor, getSideColor, formatPrice } from '@/utils/formatters'

export default function Positions() {
  const positions = useTradingStore((state) => state.positions)

  if (positions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Positions</h2>
        <div className="text-center text-gray-400 py-8">
          No open positions
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Positions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-700">
            <tr className="text-gray-400">
              <th className="text-left py-2 px-2">Symbol</th>
              <th className="text-left py-2 px-2">Side</th>
              <th className="text-right py-2 px-2">Size</th>
              <th className="text-right py-2 px-2">Entry Price</th>
              <th className="text-right py-2 px-2">Mark Price</th>
              <th className="text-right py-2 px-2">Liq. Price</th>
              <th className="text-right py-2 px-2">PnL</th>
              <th className="text-right py-2 px-2">Leverage</th>
              <th className="text-center py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.symbol} className="border-b border-slate-700 hover:bg-slate-700">
                <td className="py-3 px-2 font-semibold">{position.symbol}</td>
                <td className={`py-3 px-2 font-semibold ${getSideColor(position.side)}`}>
                  {position.side.toUpperCase()}
                </td>
                <td className="py-3 px-2 text-right">{position.size}</td>
                <td className="py-3 px-2 text-right">{formatPrice(position.entryPrice)}</td>
                <td className="py-3 px-2 text-right">{formatPrice(position.currentPrice)}</td>
                <td className="py-3 px-2 text-right text-orange-500">
                  {formatPrice(position.liquidationPrice)}
                </td>
                <td className={`py-3 px-2 text-right font-semibold ${getChangeColor(position.pnl)}`}>
                  <div>{formatUSD(position.pnl)}</div>
                  <div className="text-xs">{formatPercentage(position.pnlPercentage)}</div>
                </td>
                <td className="py-3 px-2 text-right">{position.leverage}x</td>
                <td className="py-3 px-2 text-center">
                  <button className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs">
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
