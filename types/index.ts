// Market data types
export interface Market {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export interface OrderBook {
  bids: [number, number][] // [price, size]
  asks: [number, number][]
  timestamp: number
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Trading types
export interface Order {
  id: string
  symbol: string
  side: 'long' | 'short'
  type: 'market' | 'limit' | 'stop'
  price?: number
  size: number
  leverage: number
  status: 'open' | 'filled' | 'cancelled'
  timestamp: number
}

export interface Position {
  symbol: string
  side: 'long' | 'short'
  size: number
  entryPrice: number
  currentPrice: number
  leverage: number
  marginType: 'isolated' | 'cross'
  pnl: number
  pnlPercentage: number
  liquidationPrice: number
  timestamp: number
}

// Account types
export interface Account {
  address: string
  balance: number
  marginUsed: number
  marginAvailable: number
  totalPnl: number
}

// API types
export interface HydromancerConfig {
  apiKey: string
  apiUrl: string
  wsUrl: string
}
