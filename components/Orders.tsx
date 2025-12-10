'use client'

import { useTradingStore } from '@/lib/store'
import { useCancelOrder } from '@/hooks/useHydromancer'
import { formatUSD, formatDateTime, getSideColor, formatPrice } from '@/utils/formatters'

export default function Orders() {
  const orders = useTradingStore((state) => state.orders)
  const { mutate: cancelOrder } = useCancelOrder()

  const openOrders = orders.filter((order) => order.status === 'open')

  if (openOrders.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Open Orders</h2>
        <div className="text-center text-gray-400 py-8">
          No open orders
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Open Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-700">
            <tr className="text-gray-400">
              <th className="text-left py-2 px-2">Time</th>
              <th className="text-left py-2 px-2">Symbol</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-left py-2 px-2">Side</th>
              <th className="text-right py-2 px-2">Price</th>
              <th className="text-right py-2 px-2">Size</th>
              <th className="text-right py-2 px-2">Total</th>
              <th className="text-center py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {openOrders.map((order) => (
              <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700">
                <td className="py-3 px-2 text-gray-400">{formatDateTime(order.timestamp)}</td>
                <td className="py-3 px-2 font-semibold">{order.symbol}</td>
                <td className="py-3 px-2 uppercase text-gray-400">{order.type}</td>
                <td className={`py-3 px-2 font-semibold ${getSideColor(order.side)}`}>
                  {order.side.toUpperCase()}
                </td>
                <td className="py-3 px-2 text-right">
                  {order.price ? formatPrice(order.price) : 'Market'}
                </td>
                <td className="py-3 px-2 text-right">{order.size}</td>
                <td className="py-3 px-2 text-right">
                  {order.price ? formatUSD(order.price * order.size) : '---'}
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => cancelOrder({ orderId: order.id, symbol: order.symbol })}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-xs"
                  >
                    Cancel
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
