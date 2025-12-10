import { useEffect, useRef } from 'react'
import { HydromancerWebSocket } from '@/lib/websocket'
import { useTradingStore } from '@/lib/store'

export function useWebSocket() {
  const wsRef = useRef<HydromancerWebSocket | null>(null)
  const setConnected = useTradingStore((state) => state.setConnected)
  const selectedSymbol = useTradingStore((state) => state.selectedSymbol)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_HYDROMANCER_API_KEY || ''
    const wsUrl = process.env.NEXT_PUBLIC_HYDROMANCER_WS_URL || ''

    if (!apiKey) {
      console.error('API key not configured')
      return
    }

    const ws = new HydromancerWebSocket(apiKey, wsUrl)
    wsRef.current = ws

    ws.on('auth', (data: any) => {
      if (data.success) {
        setConnected(true)
        // Subscribe to initial channels
        ws.subscribe('markets')
        ws.subscribe('ticker', selectedSymbol)
        ws.subscribe('orderbook', selectedSymbol)
      }
    })

    ws.on('disconnect', () => {
      setConnected(false)
    })

    ws.connect()

    return () => {
      ws.disconnect()
    }
  }, [setConnected])

  // Subscribe to symbol changes
  useEffect(() => {
    const ws = wsRef.current
    if (ws && selectedSymbol) {
      ws.subscribe('ticker', selectedSymbol)
      ws.subscribe('orderbook', selectedSymbol)
      ws.subscribe('trades', selectedSymbol)
    }

    return () => {
      if (ws && selectedSymbol) {
        ws.unsubscribe('ticker', selectedSymbol)
        ws.unsubscribe('orderbook', selectedSymbol)
        ws.unsubscribe('trades', selectedSymbol)
      }
    }
  }, [selectedSymbol])

  return wsRef.current
}
