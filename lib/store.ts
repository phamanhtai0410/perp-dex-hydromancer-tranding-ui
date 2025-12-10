import { create } from 'zustand'
import type { Market, Position, Order, Account } from '@/types'

interface TradingState {
  // Market data
  selectedSymbol: string
  markets: Market[]
  currentMarket: Market | null
  
  // Account & positions
  account: Account | null
  positions: Position[]
  orders: Order[]
  
  // UI state
  isConnected: boolean
  error: string | null
  
  // Actions
  setSelectedSymbol: (symbol: string) => void
  setMarkets: (markets: Market[]) => void
  setCurrentMarket: (market: Market | null) => void
  setAccount: (account: Account | null) => void
  setPositions: (positions: Position[]) => void
  addPosition: (position: Position) => void
  updatePosition: (symbol: string, updates: Partial<Position>) => void
  removePosition: (symbol: string) => void
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  removeOrder: (orderId: string) => void
  setConnected: (connected: boolean) => void
  setError: (error: string | null) => void
}

export const useTradingStore = create<TradingState>((set) => ({
  // Initial state
  selectedSymbol: 'BTC-USD',
  markets: [],
  currentMarket: null,
  account: null,
  positions: [],
  orders: [],
  isConnected: false,
  error: null,

  // Actions
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  
  setMarkets: (markets) => set({ markets }),
  
  setCurrentMarket: (market) => set({ currentMarket: market }),
  
  setAccount: (account) => set({ account }),
  
  setPositions: (positions) => set({ positions }),
  
  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, position],
    })),
  
  updatePosition: (symbol, updates) =>
    set((state) => ({
      positions: state.positions.map((pos) =>
        pos.symbol === symbol ? { ...pos, ...updates } : pos
      ),
    })),
  
  removePosition: (symbol) =>
    set((state) => ({
      positions: state.positions.filter((pos) => pos.symbol !== symbol),
    })),
  
  setOrders: (orders) => set({ orders }),
  
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),
  
  updateOrder: (orderId, updates) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      ),
    })),
  
  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    })),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  setError: (error) => set({ error }),
}))
