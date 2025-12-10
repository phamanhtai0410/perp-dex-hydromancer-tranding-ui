'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'
import { useCandles } from '@/hooks/useHydromancer'
import { useTradingStore } from '@/lib/store'

export default function TradingChart() {
  const selectedSymbol = useTradingStore((state) => state.selectedSymbol)
  const { data: candles, isLoading } = useCandles(selectedSymbol, '1h')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1E293B' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (candles && seriesRef.current) {
      const chartData = candles.map((candle) => ({
        time: candle.time as any,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
      seriesRef.current.setData(chartData)
    }
  }, [candles])

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 flex items-center justify-center h-[500px]">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{selectedSymbol}</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">1m</button>
          <button className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">5m</button>
          <button className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">15m</button>
          <button className="px-3 py-1 bg-blue-600 rounded text-sm">1h</button>
          <button className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">4h</button>
          <button className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">1D</button>
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  )
}
