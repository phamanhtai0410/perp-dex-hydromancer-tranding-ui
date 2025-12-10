import axios, { AxiosInstance } from 'axios'
import type { Market, OrderBook, Candle } from '@/types'
import { walletService } from '@/lib/wallet'
import { HyperliquidClient } from '@/lib/hyperliquid'

export class HydromancerAPI {
  private client: AxiosInstance
  private walletAddress: string | null = null
  private hyperliquidClient: HyperliquidClient | null = null

  constructor(apiKey: string, baseURL: string = 'https://api.hydromancer.xyz') {
    // Hydromancer client for all data operations
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Set wallet address if available
    this.walletAddress = walletService.getAddress()
    
    // Initialize Hyperliquid client for trading operations
    if (this.walletAddress) {
      this.initHyperliquidClient()
    }
  }

  /**
   * Initialize Hyperliquid client for trading operations
   */
  private initHyperliquidClient() {
    const hyperliquidURL = process.env.NEXT_PUBLIC_HYPERLIQUID_API_URL || 'https://api.hyperliquid-testnet.xyz'
    this.hyperliquidClient = new HyperliquidClient(hyperliquidURL)
  }

  /**
   * Set wallet address for authenticated requests
   */
  setWalletAddress(address: string) {
    this.walletAddress = address
    this.initHyperliquidClient()
  }

  // Market data endpoints using Hydromancer API
  async getSymbols(): Promise<string[]> {
    const response = await this.client.post('/info', {
      type: 'meta'
    })
    // Extract coin names from meta response
    return response.data.universe.map((asset: any) => asset.name)
  }

  async getMarketData(symbol: string): Promise<Market> {
    // Get all mids from Hydromancer
    const midsResponse = await this.client.post('/info', {
      type: 'allMids'
    })

    const price = parseFloat(midsResponse.data[symbol] || '0')

    // Get meta for additional info
    const metaResponse = await this.client.post('/info', {
      type: 'meta'
    })

    const assetInfo = metaResponse.data.universe.find((a: any) => a.name === symbol)

    return {
      symbol,
      price,
      change24h: 0, // Would need historical data
      volume24h: 0, // Would need to aggregate from trades
      high24h: price,
      low24h: price,
      fundingRate: 0, // Available in meta if needed
      openInterest: 0, // Available in meta if needed
      maxLeverage: assetInfo?.maxLeverage || 50,
    }
  }

  async getCandles(
    symbol: string,
    interval: string = '1h',
    limit: number = 100
  ): Promise<Candle[]> {
    const response = await this.client.post('/info', {
      type: 'candleSnapshot',
      req: {
        coin: symbol,
        interval,
        startTime: Date.now() - limit * 3600 * 1000, // Approximate
        endTime: Date.now()
      }
    })

    return response.data.map((candle: any) => ({
      time: candle.t / 1000, // Convert to seconds
      open: parseFloat(candle.o),
      high: parseFloat(candle.h),
      low: parseFloat(candle.l),
      close: parseFloat(candle.c),
      volume: parseFloat(candle.v),
    }))
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    const response = await this.client.post('/info', {
      type: 'l2Book',
      coin: symbol
    })

    const data = response.data.levels || [[],[]]

    return {
      bids: data[0]?.map(([price, size]: [string, string]) => ({
        price: parseFloat(price),
        size: parseFloat(size),
      })) || [],
      asks: data[1]?.map(([price, size]: [string, string]) => ({
        price: parseFloat(price),
        size: parseFloat(size),
      })) || [],
    }
  }

  // Trading operations using Hyperliquid API
  async placeOrder(params: {
    symbol: string
    side: 'long' | 'short'
    type: 'market' | 'limit'
    size: number
    price?: number
    leverage?: number
  }) {
    if (!this.hyperliquidClient) {
      throw new Error('Hyperliquid client not initialized. Please connect wallet first.')
    }

    return await this.hyperliquidClient.placeOrder(params)
  }

  async cancelOrder(orderId: string, symbol: string) {
    if (!this.hyperliquidClient) {
      throw new Error('Hyperliquid client not initialized. Please connect wallet first.')
    }

    return await this.hyperliquidClient.cancelOrder(orderId, symbol)
  }

  async cancelOrderByCloid(symbol: string, cloid: string) {
    if (!this.hyperliquidClient) {
      throw new Error('Hyperliquid client not initialized. Please connect wallet first.')
    }

    return await this.hyperliquidClient.cancelOrderByCloid(symbol, cloid)
  }

  async modifyOrder(params: {
    orderId: string
    symbol: string
    size?: number
    price?: number
  }) {
    if (!this.hyperliquidClient) {
      throw new Error('Hyperliquid client not initialized. Please connect wallet first.')
    }

    return await this.hyperliquidClient.modifyOrder(params)
  }

  // Account data using Hydromancer API
  async getPositions(address?: string) {
    const userAddress = address || this.walletAddress
    if (!userAddress) {
      throw new Error('Wallet address not available')
    }

    const response = await this.client.post('/info', {
      type: 'clearinghouseState',
      user: userAddress
    })
    
    return response.data.assetPositions?.map((pos: any) => ({
      symbol: pos.position.coin,
      side: parseFloat(pos.position.szi) > 0 ? 'long' : 'short',
      size: Math.abs(parseFloat(pos.position.szi)),
      entryPrice: parseFloat(pos.position.entryPx),
      markPrice: parseFloat(pos.position.positionValue) / Math.abs(parseFloat(pos.position.szi)),
      liquidationPrice: parseFloat(pos.position.liquidationPx || 0),
      unrealizedPnl: parseFloat(pos.position.unrealizedPnl),
      leverage: parseFloat(pos.position.leverage.value),
    })).filter((pos: any) => pos.size > 0) || []
  }

  async getOrders(address?: string) {
    const userAddress = address || this.walletAddress
    if (!userAddress) {
      throw new Error('Wallet address not available')
    }

    const response = await this.client.post('/info', {
      type: 'openOrders',
      user: userAddress
    })

    return response.data?.map((order: any) => ({
      orderId: order.oid,
      symbol: order.coin,
      side: order.side === 'B' ? 'long' : 'short',
      type: order.orderType,
      size: parseFloat(order.sz),
      price: parseFloat(order.limitPx),
      filled: parseFloat(order.sz) - parseFloat(order.szRemaining || order.sz),
      status: 'open',
      timestamp: order.timestamp,
    })) || []
  }

  async getAccountInfo(address?: string) {
    const userAddress = address || this.walletAddress
    if (!userAddress) {
      throw new Error('Wallet address not available')
    }

    const response = await this.client.post('/info', {
      type: 'clearinghouseState',
      user: userAddress
    })

    const marginSummary = response.data.marginSummary

    return {
      address: userAddress,
      balance: parseFloat(marginSummary?.accountValue || '0'),
      marginUsed: parseFloat(marginSummary?.totalMarginUsed || '0'),
      marginAvailable: parseFloat(marginSummary?.withdrawable || '0'),
      totalPnl: parseFloat(marginSummary?.totalUnrealizedPnl || '0'),
    }
  }
}
