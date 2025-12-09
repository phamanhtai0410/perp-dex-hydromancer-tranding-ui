import axios, { AxiosInstance } from 'axios'
import type { Market, OrderBook, Candle } from '@/types'

export class HydromancerAPI {
  private client: AxiosInstance

  constructor(apiKey: string, baseURL: string = 'https://api.hydromancer.xyz') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
  }

  // Market data endpoints
  async getSymbols(): Promise<string[]> {
    const response = await this.client.get('/api/symbols')
    return response.data
  }

  async getMarketData(symbol: string): Promise<Market> {
    const response = await this.client.get(`/api/market/${symbol}`)
    return response.data
  }

  async getCandles(symbol: string, interval: string = '1h'): Promise<Candle[]> {
    const response = await this.client.get(`/api/candles/${symbol}`, {
      params: { interval }
    })
    return response.data
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    const response = await this.client.get(`/api/orderbook/${symbol}`)
    return response.data
  }

  // Trading endpoints (placeholder for future implementation)
  async placeOrder(params: {
    symbol: string
    side: 'long' | 'short'
    type: 'market' | 'limit'
    size: number
    price?: number
    leverage?: number
  }) {
    const response = await this.client.post('/api/order', params)
    return response.data
  }

  async cancelOrder(orderId: string) {
    const response = await this.client.delete(`/api/order/${orderId}`)
    return response.data
  }

  async getPositions() {
    const response = await this.client.get('/api/positions')
    return response.data
  }
}

export default HydromancerAPI
